/**
 * Game state: one plain object, mutated only through the exported helpers.
 * Keeping it serialisable means save/load is a JSON round-trip.
 */
import { ARMOR_ORDER } from '../data/armor.js';
import { MODES, WEEK_LENGTH } from '../data/modes.js';
import { STARTING_VERSES } from '../data/scriptures.js';
import { clamp } from './util.js';

export const SAVE_SCHEMA = 1;

export function createState(modeId = 'growing') {
  const mode = MODES[modeId] || MODES.growing;
  const armor = {};
  for (const id of ARMOR_ORDER) armor[id] = mode.startArmor;

  return {
    schema: SAVE_SCHEMA,
    modeId: mode.id,
    day: 1,
    weekLength: WEEK_LENGTH,
    phase: 'morning',
    armor,
    grace: 0,
    verses: [...STARTING_VERSES],
    newVerses: [],
    streak: 0,
    bestStreak: 0,
    intercessionCharges: mode.intercession,
    intercessionUsed: 0,
    // Per-day working data, reset each morning
    dayPlan: {},
    budgetLeft: mode.budget,
    dayLog: [],
    // Run tallies
    stats: {
      threats: 0,
      blocked: 0,
      breached: 0,
      flesh: 0,
      scriptureStrikes: 0,
      perfectDays: 0,
      intercessions: 0,
      devotionSlotsUsed: 0,
      versesFound: 0
    },
    dayResults: [],
    events: [],
    finished: false,
    startedAt: Date.now()
  };
}

export const mode = (state) => MODES[state.modeId] || MODES.growing;

export function armorAvg(state) {
  const vals = ARMOR_ORDER.map((id) => state.armor[id]);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function weakestArmor(state) {
  return ARMOR_ORDER.reduce((a, b) => (state.armor[a] <= state.armor[b] ? a : b));
}

export function strongestArmor(state) {
  return ARMOR_ORDER.reduce((a, b) => (state.armor[a] >= state.armor[b] ? a : b));
}

/** Apply a delta map like { truth: +5, faith: -3 } and return the applied deltas. */
export function applyArmor(state, deltas) {
  const applied = {};
  for (const [id, amount] of Object.entries(deltas)) {
    if (!(id in state.armor)) continue;
    const before = state.armor[id];
    state.armor[id] = clamp(before + amount);
    const real = state.armor[id] - before;
    if (real !== 0) applied[id] = real;
  }
  return applied;
}

export function addVerse(state, verseId) {
  if (state.verses.includes(verseId)) return false;
  state.verses.push(verseId);
  if (!state.newVerses.includes(verseId)) state.newVerses.push(verseId);
  state.stats.versesFound += 1;
  return true;
}

export function resetDay(state) {
  state.dayPlan = {};
  state.budgetLeft = mode(state).budget;
  state.dayLog = [];
}

export function log(state, text, kind = 'note') {
  state.dayLog.push({ text, kind, at: Date.now() });
  if (state.dayLog.length > 60) state.dayLog.shift();
}

/** Weekly readiness score (0-100), weighted toward the final armor state. */
export function weeklyScore(state) {
  const finalArmor = armorAvg(state);
  const total = Math.max(1, state.stats.threats);
  const blockRate = state.stats.blocked / total;
  const fleshRate = state.stats.flesh / total;
  const scriptureBonus = Math.min(1, state.stats.scriptureStrikes / Math.max(4, total * 0.4));
  const streakBonus = Math.min(1, state.bestStreak / 6);

  const score =
    finalArmor * 0.52 +
    blockRate * 100 * 0.24 +
    (1 - fleshRate) * 100 * 0.1 +
    scriptureBonus * 100 * 0.08 +
    streakBonus * 100 * 0.06;

  return Math.round(clamp(score));
}

/** Snapshot for the debrief screen. */
export function summarize(state) {
  const total = Math.max(1, state.stats.threats);
  return {
    score: weeklyScore(state),
    finalArmor: Math.round(armorAvg(state)),
    blockRate: Math.round((state.stats.blocked / total) * 100),
    fleshRate: Math.round((state.stats.flesh / total) * 100),
    weakest: weakestArmor(state),
    strongest: strongestArmor(state),
    ...state.stats
  };
}
