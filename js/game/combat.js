/**
 * Encounter generation and resolution.
 *
 * An encounter presents one threat and four options:
 *   1. The right defense (armor piece that answers this threat family)
 *   2. A decoy armor piece (plausible but wrong)
 *   3. A Scripture (only valid if the player owns a verse that counters it)
 *   4. A fleshly reaction (always available, always costly)
 *
 * Outcomes are computed here and returned as plain data so the UI can
 * animate them without knowing any rules.
 */
import { THREATS, THREAT_BY_ID } from '../data/threats.js';
import { SCRIPTURES, SCRIPTURE_BY_ID } from '../data/scriptures.js';
import { ARMOR_BY_ID, ARMOR_ORDER } from '../data/armor.js';
import { pick, pickWeighted, shuffle, clamp, randInt } from '../core/util.js';
import { mode } from '../core/state.js';

/* ---------- Threat selection ---------- */

/**
 * Score a threat's relevance: threats aimed at weak armor are more likely,
 * and tier-2 threats only appear from day 3 onward.
 */
function threatWeight(threat, state) {
  const minTarget = Math.min(...threat.targets.map((t) => state.armor[t]));
  // Weakness pressure: 0 at full armor, up to ~2.6 at zero armor
  const pressure = (100 - minTarget) / 38;
  const tierGate = threat.tier === 2 && state.day < 3 ? 0.12 : 1;
  return Math.max(0.15, 0.55 + pressure) * tierGate;
}

export function buildDayThreats(state, rng = Math.random) {
  const m = mode(state);
  const count = m.threatsPerDay;
  const chosen = [];
  const used = new Set();

  for (let i = 0; i < count; i += 1) {
    const pool = THREATS.filter((t) => !used.has(t.id));
    if (!pool.length) break;
    const picked = pickWeighted(pool, pool.map((t) => threatWeight(t, state)), rng);
    used.add(picked.id);
    chosen.push(picked.id);
  }
  return chosen;
}

/* ---------- Encounter assembly ---------- */

/** Armor pieces that could plausibly be confused with the right answer. */
function decoyFor(threat) {
  const wrong = ARMOR_ORDER.filter(
    (id) => id !== threat.defense && !threat.targets.includes(id)
  );
  const fromTargets = threat.targets.filter((id) => id !== threat.defense);
  const pool = fromTargets.length ? fromTargets.concat(wrong) : wrong;
  return pick(pool.length ? pool : ARMOR_ORDER.filter((id) => id !== threat.defense));
}

/**
 * Pick the verse option. Prefers a verse the player owns (so the option is
 * usable), and only offers a locked verse when they own none for this kind.
 */
export function scriptureOptionFor(threat, state) {
  const matches = SCRIPTURES.filter((s) => s.counters.includes(threat.id));
  const owned = matches.filter((s) => state.verses.includes(s.id));
  if (owned.length) return { verse: pick(owned), owned: true };
  if (matches.length) return { verse: pick(matches), owned: false };
  return { verse: SCRIPTURE_BY_ID[threat.verseHint], owned: false };
}

export function createEncounter(threatId, state, index = 0) {
  const threat = THREAT_BY_ID[threatId];
  const m = mode(state);
  const decoyId = decoyFor(threat);
  const { verse, owned } = scriptureOptionFor(threat, state);

  const correctArmor = ARMOR_BY_ID[threat.defense];
  const decoyArmor = ARMOR_BY_ID[decoyId];

  const options = shuffle([
    {
      key: 'a',
      type: 'armor',
      armorId: threat.defense,
      correct: true,
      label: `Raise the ${correctArmor.name}`,
      hint: correctArmor.maintain[0]
    },
    {
      key: 'b',
      type: 'armor',
      armorId: decoyId,
      correct: false,
      label: `Raise the ${decoyArmor.name}`,
      hint: 'Feels related, but this is not the answer to this attack.'
    },
    {
      key: 'c',
      type: 'scripture',
      verseId: verse.id,
      owned,
      correct: owned,
      label: `Speak ${verse.ref}`,
      hint: owned ? 'Cut the lie with the Word.' : 'You have not hidden this verse yet.'
    },
    {
      key: 'd',
      type: 'flesh',
      correct: false,
      label: threat.fleshLabel,
      hint: 'Fast, familiar, and it never works.'
    }
  ]);

  // Hidden traps: at low prayer, one option is camouflaged (revealed by watchfulness)
  const trapHidden =
    m.hiddenTraps && state.armor.prayer < 45 && index > 0;

  return {
    id: `enc-${state.day}-${index}-${threat.id}`,
    index,
    threat,
    threatId: threat.id,
    options,
    verseId: verse.id,
    verseOwned: owned,
    decoyId,
    trapHidden,
    revealAt: m.window,
    window: m.window
  };
}

/* ---------- Resolution ---------- */

const BASE_BLOCK = 9;
const BASE_BREACH = 13;
const FLESH_HIT = 17;

/**
 * Resolve a chosen option into a result payload.
 * `timing` is 0..1 of the response window remaining (1 = instant).
 */
export function resolveChoice(encounter, option, state, timing = 0.6) {
  const m = mode(state);
  const threat = encounter.threat;
  const speedBonus = Math.round(timing * 4);

  if (option.type === 'scripture' && option.owned) {
    return {
      outcome: 'strike',
      title: 'The Word Lands',
      body: threat.blockText,
      tone: 'good',
      deltas: {
        [threat.defense]: BASE_BLOCK + speedBonus + 4,
        sword: 6,
        faith: 3
      },
      grace: 3 + m.gracePerBlock,
      streakUp: true,
      verseId: option.verseId,
      strike: true
    };
  }

  if (option.type === 'scripture' && !option.owned) {
    // Reaching for a verse you have not hidden: honest, but it does not cut.
    return {
      outcome: 'fumble',
      title: 'A Verse You Have Not Hidden',
      body: 'You reach for the Word and find only the reference. Memorizing is not optional equipment \u2014 it is the edge of the blade.',
      tone: 'mixed',
      deltas: { sword: -4, faith: -3, [threat.defense]: -4 },
      grace: 0,
      streakUp: false,
      verseId: option.verseId,
      revealsVerse: option.verseId
    };
  }

  if (option.type === 'armor' && option.correct) {
    const decoyPenalty = state.armor[option.armorId] < 30 ? 0.5 : 1;
    const gain = Math.round((BASE_BLOCK + speedBonus) * decoyPenalty);
    const deltas = { [option.armorId]: gain };
    // Answering with the right piece also steadies its neighbours
    if (threat.targets.length > 1) {
      deltas[threat.targets.find((t) => t !== option.armorId)] = 3;
    }
    return {
      outcome: 'block',
      title: 'Held the Line',
      body: threat.blockText,
      tone: 'good',
      deltas,
      grace: 1 + m.gracePerBlock,
      streakUp: true
    };
  }

  if (option.type === 'armor' && !option.correct) {
    return {
      outcome: 'miss',
      title: 'The Wrong Piece',
      body: `The ${ARMOR_BY_ID[option.armorId].name} is real armor, but it is not this attack's answer. ${threat.landText}`,
      tone: 'bad',
      deltas: {
        [threat.defense]: -Math.round(BASE_BREACH * 0.7 * m.fleshPenalty),
        [option.armorId]: -3
      },
      grace: 0,
      streakUp: false,
      breach: true
    };
  }

  // Flesh reaction
  return {
    outcome: 'flesh',
    title: 'Reacted in the Flesh',
    body: `${threat.fleshText} The weapons of the flesh have no divine power here.`,
    tone: 'bad',
    deltas: {
      [threat.defense]: -Math.round(FLESH_HIT * m.fleshPenalty),
      prayer: -4,
      peace: -3
    },
    grace: 0,
    streakUp: false,
    breach: true,
    flesh: true
  };
}

/** Timeout: the player froze. Sober-mindedness lapsed. */
export function resolveTimeout(encounter, state) {
  const m = mode(state);
  return {
    outcome: 'timeout',
    title: 'You Froze',
    body: `Watchfulness lapsed and the ${encounter.threat.name.toLowerCase()} landed unanswered. ${encounter.threat.landText}`,
    tone: 'bad',
    deltas: {
      [encounter.threat.defense]: -Math.round(BASE_BREACH * m.fleshPenalty),
      prayer: -6
    },
    grace: 0,
    streakUp: false,
    breach: true
  };
}

/** Natural end-of-day armor decay from neglect, reduced by the morning plan. */
export function computeDailyDecay(state) {
  const m = mode(state);
  const mods = state.decayMod || {};
  const deltas = {};
  for (const id of ARMOR_ORDER) {
    const meta = ARMOR_BY_ID[id];
    const planMod = typeof mods[id] === 'number' ? mods[id] : 1;
    const raw = meta.decays * m.decay * 2.1 * planMod;
    deltas[id] = -Math.round(raw * 10) / 10;
  }
  return deltas;
}

/** Verses to unlock at the end of a day, based on performance and mode. */
export function verseReward(state) {
  const m = mode(state);
  if (m.versesPerDay <= 0) return null;
  const owned = new Set(state.verses);
  const pool = SCRIPTURES.filter((s) => !owned.has(s.id));
  if (!pool.length) return null;
  // Prefer verses that counter this week's trouble
  const recent = state.stats.threats ? state.dayResults.flatMap((d) => d.threatIds || []) : [];
  const preferred = pool.filter((s) => s.counters.some((c) => recent.includes(c)));
  return pick(preferred.length ? preferred : pool);
}

export function intercessionThreatFor(state, rng = Math.random) {
  const weak = ARMOR_ORDER.reduce((a, b) => (state.armor[a] <= state.armor[b] ? a : b));
  const candidates = THREATS.filter((t) => t.targets.includes(weak));
  return pick(candidates.length ? candidates : THREATS, rng);
}

export { THREATS, THREAT_BY_ID, ARMOR_BY_ID, randInt, clamp };
