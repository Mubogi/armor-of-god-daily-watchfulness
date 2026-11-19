/** Difficulty modes. Every knob that changes the tactical pressure lives here. */
export const MODES = {
  new: {
    id: 'new',
    name: 'New Believer',
    tagline: 'Mercy-forward. Learn the armor without drowning.',
    desc: 'Generous devotion budget, slow threats, forgiving decay, and traps are always revealed. Best first week.',
    budget: 6,
    threatsPerDay: 3,
    window: 15,
    decay: 0.6,
    startArmor: 80,
    hiddenTraps: false,
    gracePerBlock: 2,
    fleshPenalty: 1.0,
    versesPerDay: 1,
    intercession: 2,
    chips: ['6 devotion slots', '3 threats/day', '15s window', 'Traps revealed']
  },
  growing: {
    id: 'growing',
    name: 'Growing Disciple',
    tagline: 'The intended rhythm. Watchful, not frantic.',
    desc: 'Balanced budget and pressure. Hidden traps appear when prayer runs low. Forgiveness still outruns failure.',
    budget: 5,
    threatsPerDay: 4,
    window: 10.5,
    decay: 1.0,
    startArmor: 68,
    hiddenTraps: true,
    gracePerBlock: 1,
    fleshPenalty: 1.25,
    versesPerDay: 1,
    intercession: 3,
    chips: ['5 devotion slots', '4 threats/day', '10.5s window', 'Hidden traps']
  },
  watchman: {
    id: 'watchman',
    name: 'Watchman',
    tagline: 'Sober-minded. The lion is real and close.',
    desc: 'Tight budget, fast threats, heavy decay, and traps stay hidden below a prayer threshold. Nothing is wasted.',
    budget: 4,
    threatsPerDay: 5,
    window: 7.5,
    decay: 1.35,
    startArmor: 56,
    hiddenTraps: true,
    gracePerBlock: 0,
    fleshPenalty: 1.55,
    versesPerDay: 0,
    intercession: 4,
    chips: ['4 devotion slots', '5 threats/day', '7.5s window', 'Brutal decay']
  }
};

export const MODE_LIST = Object.values(MODES);

export const WEEK_LENGTH = 7;

export const PHASES = [
  { id: 'morning', label: 'Morning Watch', clock: '06:00', tint: '#ffc978' },
  { id: 'midday', label: 'Midday Trials', clock: '12:30', tint: '#8fb4ff' },
  { id: 'afternoon', label: 'Afternoon Pressures', clock: '15:00', tint: '#a58cff' },
  { id: 'evening', label: 'Evening Examen', clock: '21:00', tint: '#7f8ec4' }
];
