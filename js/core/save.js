/** localStorage persistence with versioning, safe parsing, and quota handling. */
const PREFIX = 'aogdw:';
const KEY = `${PREFIX}save`;
const META_KEY = `${PREFIX}meta`;
const VERSION = 1;

function safeParse(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function loadSave() {
  const data = safeParse(safeGet(KEY));
  if (!data || data.version !== VERSION) return null;
  return data;
}

export function writeSave(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...state, version: VERSION, savedAt: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
}

export function hasSave() {
  return Boolean(loadSave());
}

/** Cross-run meta progression: unlocked verses, seen cards, lifetime stats. */
export function loadMeta() {
  const data = safeParse(safeGet(META_KEY));
  return {
    unlockedVerses: [],
    runsCompleted: 0,
    bestScore: 0,
    bestRank: '',
    totalBlocks: 0,
    seenIntro: false,
    ...(data || {})
  };
}

export function writeMeta(meta) {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
}

export function storageAvailable() {
  try {
    const probe = `${PREFIX}probe`;
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
