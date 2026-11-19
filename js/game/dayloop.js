/**
 * Day loop: morning planning, threat waves, evening examen, and the
 * transition into the next day. Pure state transitions — no DOM.
 */
import { ARMOR_BY_ID, ARMOR_ORDER } from '../data/armor.js';
import { DEVOTION_BY_ID, EVENING_BY_ID } from '../data/devotions.js';
import { SCRIPTURE_BY_ID } from '../data/scriptures.js';
import { applyArmor, addVerse, log, mode, resetDay } from '../core/state.js';
import { computeDailyDecay, verseReward, buildDayThreats, createEncounter } from './combat.js';
import { clamp, pick } from '../core/util.js';

/* ---------- Morning Watch ---------- */

export function planCost(state) {
  return Object.entries(state.dayPlan).reduce((total, [id, count]) => {
    const dev = DEVOTION_BY_ID[id];
    return total + (dev ? count : 0);
  }, 0);
}

export function canAddDevotion(state, devId) {
  const dev = DEVOTION_BY_ID[devId];
  if (!dev) return false;
  const used = state.dayPlan[devId] || 0;
  if (used >= dev.max) return false;
  return planCost(state) < mode(state).budget;
}

export function addDevotion(state, devId) {
  if (!canAddDevotion(state, devId)) return false;
  state.dayPlan[devId] = (state.dayPlan[devId] || 0) + 1;
  state.budgetLeft = mode(state).budget - planCost(state);
  return true;
}

export function removeDevotion(state, devId) {
  const used = state.dayPlan[devId] || 0;
  if (used <= 0) return false;
  if (used === 1) delete state.dayPlan[devId];
  else state.dayPlan[devId] = used - 1;
  state.budgetLeft = mode(state).budget - planCost(state);
  return true;
}

/**
 * Commit the morning plan: apply armor gains, build the decay multipliers
 * for today, and unlock the day's verse.
 */
export function commitMorning(state) {
  const gains = {};
  const decayMod = {};
  for (const id of ARMOR_ORDER) decayMod[id] = 1;

  for (const [devId, count] of Object.entries(state.dayPlan)) {
    const dev = DEVOTION_BY_ID[devId];
    if (!dev) continue;
    for (const [armorId, amount] of Object.entries(dev.gains)) {
      gains[armorId] = (gains[armorId] || 0) + amount * count;
    }
    for (const [armorId, mult] of Object.entries(dev.decayMod || {})) {
      decayMod[armorId] = Math.min(decayMod[armorId], mult);
    }
    if (dev.intercessionCharge) {
      state.intercessionCharges += dev.intercessionCharge * count;
    }
    state.stats.devotionSlotsUsed += count;
  }

  const applied = applyArmor(state, gains);
  state.decayMod = decayMod;
  state.morningGains = applied;

  const verse = unlockMorningVerse(state);
  state.morningVerse = verse ? verse.id : null;
  if (verse) addVerse(state, verse.id);

  log(state, `Morning Watch: ${planCost(state)} of ${mode(state).budget} slots spent.`, 'morning');
  state.phase = 'midday';
  return { gains: applied, verse };
}

/** The verse unlocked by Scripture Memory (or the day's free verse). */
function unlockMorningVerse(state) {
  const studied = (state.dayPlan.scripture || 0) > 0;
  const owned = new Set(state.verses);
  const pool = Object.values(SCRIPTURE_BY_ID).filter((v) => !owned.has(v.id));
  if (!pool.length) return null;
  if (!studied && mode(state).versesPerDay <= 0) return null;
  // Favour verses that answer this week's pressure
  const threats = state.dayThreatIds || [];
  const preferred = pool.filter((v) => v.counters.some((c) => threats.includes(c)));
  return pick(preferred.length ? preferred : pool);
}

/* ---------- Battle wave ---------- */

export function beginBattle(state) {
  state.dayThreatIds = buildDayThreats(state);
  state.waveIndex = 0;
  state.phase = 'battle';
  return state.dayThreatIds;
}

export function nextEncounter(state) {
  if (state.waveIndex >= state.dayThreatIds.length) return null;
  const enc = createEncounter(state.dayThreatIds[state.waveIndex], state, state.waveIndex);
  state.currentEncounter = enc;
  return enc;
}

/**
 * Apply a resolution payload to the state and update all tallies.
 * Returns the applied deltas plus bookkeeping for the UI.
 */
export function applyResult(state, encounter, result) {
  const applied = applyArmor(state, result.deltas);

  state.stats.threats += 1;
  if (result.streakUp) {
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
  } else {
    state.streak = 0;
  }

  if (result.outcome === 'block' || result.outcome === 'strike') {
    state.stats.blocked += 1;
  } else if (result.flesh) {
    state.stats.flesh += 1;
    state.stats.breached += 1;
  } else if (result.breach) {
    state.stats.breached += 1;
  }

  if (result.strike) state.stats.scriptureStrikes += 1;
  if (typeof result.grace === 'number') state.grace += result.grace;

  if (result.revealsVerse) {
    addVerse(state, result.revealsVerse);
  }

  state.dayLog.push({
    text: `${encounter.threat.name}: ${result.title}`,
    kind: result.tone === 'good' ? 'good' : result.tone === 'mixed' ? 'mixed' : 'bad',
    at: Date.now()
  });

  state.waveIndex += 1;
  return applied;
}

/* ---------- Intercession ---------- */

export function useIntercession(state) {
  if (state.intercessionCharges <= 0) return null;
  state.intercessionCharges -= 1;
  state.intercessionUsed += 1;
  state.stats.intercessions += 1;
  // Standing with someone else strengthens your own weakest piece
  const applied = applyArmor(state, { faith: 5, prayer: 4, peace: 3 });
  log(state, 'You stood with a brother or sister in prayer. Protection widened.', 'intercession');
  return applied;
}

/* ---------- Evening ---------- */

export function eveningAct(state, actId) {
  const act = EVENING_BY_ID[actId];
  if (!act) return null;
  const applied = applyArmor(state, act.gains);
  state.eveningAct = actId;
  log(state, act.log, 'evening');
  return applied;
}

/**
 * Close the day: apply neglect decay, tally results, grant a verse reward.
 * Returns a summary the UI shows before the next morning.
 */
export function closeDay(state) {
  const decay = computeDailyDecay(state);
  const appliedDecay = applyArmor(state, decay);

  const dayStats = {
    day: state.day,
    blocked: state.stats.blocked,
    breached: state.stats.breached,
    flesh: state.stats.flesh,
    threats: state.stats.threats,
    threatIds: [...(state.dayThreatIds || [])],
    morningGains: state.morningGains || {},
    decay: appliedDecay,
    eveningAct: state.eveningAct || null
  };

  const hadBreach = dayStats.breached > 0;
  if (!hadBreach && dayStats.threats > 0) {
    state.stats.perfectDays += 1;
  }

  const reward = verseReward(state);
  if (reward) addVerse(state, reward.id);
  dayStats.reward = reward ? reward.id : null;

  state.dayResults.push(dayStats);
  state.phase = 'night';

  return { dayStats, decay: appliedDecay, reward };
}

export function advanceDay(state) {
  state.day += 1;
  state.streak = 0;
  state.eveningAct = null;
  state.currentEncounter = null;
  state.waveIndex = 0;
  state.morningGains = {};
  state.morningVerse = null;
  state.decayMod = {};
  resetDay(state);
  if (state.day > state.weekLength) {
    state.finished = true;
    state.phase = 'debrief';
  } else {
    state.phase = 'morning';
  }
  return state;
}

/** Guardrail: the whole-armor average can never sit at zero without notice. */
export function isArmorCritical(state) {
  return ARMOR_ORDER.some((id) => state.armor[id] < 20);
}

export { ARMOR_BY_ID, clamp };
