/**
 * Morning Watch activities. Each day the player spends a limited attention
 * budget here; allocation sets the armor gains AND the daily decay multiplier.
 */
export const DEVOTIONS = [
  {
    id: 'scripture',
    name: 'Scripture Memory',
    icon: 'sword',
    accent: 'var(--sword)',
    hint: 'Hide the Word in your heart before the day asks for it.',
    gains: { sword: 16, truth: 4 },
    decayMod: { sword: 0.45 },
    unlocksVerse: true,
    max: 2
  },
  {
    id: 'prayer',
    name: 'Prayer & Stillness',
    icon: 'prayer',
    accent: 'var(--prayer)',
    hint: 'Alertness is built in the quiet, before anything is happening.',
    gains: { prayer: 18, faith: 3 },
    decayMod: { prayer: 0.4, faith: 0.8 },
    max: 2
  },
  {
    id: 'confession',
    name: 'Confession & Honesty',
    icon: 'belt',
    accent: 'var(--truth)',
    hint: 'Name the truth out loud. The belt tightens fastest this way.',
    gains: { truth: 15, righteousness: 8 },
    decayMod: { truth: 0.5 },
    max: 1
  },
  {
    id: 'worship',
    name: 'Worship & Remembering',
    icon: 'helmet',
    accent: 'var(--salvation)',
    hint: 'Preach the gospel to yourself. Identity before activity.',
    gains: { salvation: 15, faith: 6 },
    decayMod: { salvation: 0.5, faith: 0.85 },
    max: 1
  },
  {
    id: 'reconcile',
    name: 'Reconciliation',
    icon: 'shoes',
    accent: 'var(--peace)',
    hint: 'Forgive before you feel it. Peace is footing you choose.',
    gains: { peace: 16, righteousness: 4 },
    decayMod: { peace: 0.45 },
    max: 1
  },
  {
    id: 'service',
    name: 'Service & Intercession',
    icon: 'shield',
    accent: 'var(--faith)',
    hint: 'Pray for someone else\u2019s battle and your own shield widens.',
    gains: { prayer: 9, peace: 7, faith: 5 },
    decayMod: { peace: 0.8 },
    intercessionCharge: 1,
    max: 1
  },
  {
    id: 'rest',
    name: 'Rest & Silence',
    icon: 'prayer',
    accent: 'var(--jade)',
    hint: 'Choose rest on purpose instead of numbing by accident.',
    gains: { prayer: 6, salvation: 5 },
    decayMod: { prayer: 0.7, salvation: 0.9, sword: 0.95 },
    max: 1
  }
];

export const DEVOTION_BY_ID = Object.fromEntries(DEVOTIONS.map((d) => [d.id, d]));

/** Evening Examen choices — small, always available, no budget. */
export const EVENING_ACTS = [
  {
    id: 'examine',
    name: 'Examine the Day',
    icon: 'prayer',
    accent: 'var(--prayer)',
    hint: 'Where did you see God today? Where did you resist him?',
    gains: { prayer: 7, truth: 5 },
    log: 'You walk back through the day with God instead of alone.'
  },
  {
    id: 'gratitude',
    name: 'Name Three Gifts',
    icon: 'helmet',
    accent: 'var(--salvation)',
    hint: 'Gratitude is how the mind stops drifting.',
    gains: { salvation: 8, faith: 4 },
    log: 'Three specific gifts, named out loud. The day looks different.'
  },
  {
    id: 'forgive',
    name: 'Release One Offense',
    icon: 'shoes',
    accent: 'var(--peace)',
    hint: 'One name. One release. Before sleep.',
    gains: { peace: 9, righteousness: 3 },
    log: 'You hand one name over and refuse to pick it back up.'
  },
  {
    id: 'repent',
    name: 'Repent of One Thing',
    icon: 'belt',
    accent: 'var(--righteousness)',
    hint: 'Specific, not general. General repentance is mostly a mood.',
    gains: { righteousness: 9, truth: 6 },
    log: 'One specific thing, named and released. Cleansing follows confession.'
  },
  {
    id: 'sharpen',
    name: 'Review One Verse',
    icon: 'sword',
    accent: 'var(--sword)',
    hint: 'A dull blade is a forgotten blade.',
    gains: { sword: 9, faith: 3 },
    log: 'You rehearse a verse until it is available under pressure.'
  }
];

export const EVENING_BY_ID = Object.fromEntries(EVENING_ACTS.map((e) => [e.id, e]));
