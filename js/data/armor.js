/**
 * The seven spiritual readiness gauges (Ephesians 6:14-18 + 1 Peter 5:8).
 * Order matters: it drives HUD rendering, tray order and codex grouping.
 */
export const ARMOR = [
  {
    id: 'truth',
    name: 'Belt of Truth',
    short: 'Truth',
    hue: 'var(--truth)',
    hex: '#f0d38a',
    verse: 'Ephesians 6:14',
    key: '1',
    icon: 'belt',
    blurb: 'Held by honesty, confession, and refusing self-deception. A loose belt lets compromise slip in.',
    decays: 1.0,
    breach: 'Double-mindedness. Half-truths start to feel normal, and you begin negotiating with what you know is wrong.',
    restore: 'Name the truth out loud to God. Confession tightens the belt faster than anything else.',
    maintain: ['Confess quickly', 'Speak plainly', 'Reject flattery']
  },
  {
    id: 'righteousness',
    name: 'Breastplate of Righteousness',
    short: 'Righteousness',
    hue: 'var(--righteous)',
    hex: '#b9c9ff',
    verse: 'Ephesians 6:14',
    key: '2',
    icon: 'breastplate',
    blurb: 'Held by obedience, pure motives, and quick repentance. It guards the heart from guilt and condemnation.',
    decays: 1.0,
    breach: 'Condemnation floods in. Shame speaks louder than grace, and you start hiding instead of repenting.',
    restore: 'Repent specifically, then receive forgiveness as a gift rather than a reward.',
    maintain: ['Repent fast', 'Guard motives', 'Receive grace']
  },
  {
    id: 'peace',
    name: 'Shoes of the Gospel of Peace',
    short: 'Peace',
    hue: 'var(--peace)',
    hex: '#7fe3c4',
    verse: 'Ephesians 6:15',
    key: '3',
    icon: 'shoes',
    blurb: 'Held by forgiveness, peacemaking, and readiness to share Christ. Firm footing keeps you from stumbling.',
    decays: 1.0,
    breach: 'Bitterness takes root. Small offenses become evidence you rehearse, and panic sets the pace.',
    restore: 'Forgive before you feel like it. Peace is a footing you choose, not a mood you wait for.',
    maintain: ['Forgive early', 'Make peace', 'Stay ready to share']
  },
  {
    id: 'faith',
    name: 'Shield of Faith',
    short: 'Faith',
    hue: 'var(--faith)',
    hex: '#8fb4ff',
    verse: 'Ephesians 6:16',
    key: '4',
    icon: 'shield',
    blurb: 'Held by trusting God\u2019s promises. It extinguishes the fiery darts of fear, doubt, despair, and sudden crisis.',
    decays: 1.2,
    breach: 'Fiery darts land unblocked. Fear arrives first and reasons second, and crisis feels like abandonment.',
    restore: 'Quote a promise you actually believe, then act on it before the feeling returns.',
    maintain: ['Recall promises', 'Act on faith', 'Refuse dread']
  },
  {
    id: 'salvation',
    name: 'Helmet of Salvation',
    short: 'Salvation',
    hue: 'var(--salvation)',
    hex: '#d8b6ff',
    verse: 'Ephesians 6:17',
    key: '5',
    icon: 'helmet',
    blurb: 'Held by remembering your identity in Christ and your eternal hope. It shields the mind from confusion and pride.',
    decays: 1.0,
    breach: 'Confusion and worldly thinking creep in. Identity drifts toward performance, comparison, and applause.',
    restore: 'Preach the gospel to yourself. You are adopted, sealed, and kept \u2014 not merely tolerated.',
    maintain: ['Remember adoption', 'Renew the mind', 'Hold eternal hope']
  },
  {
    id: 'sword',
    name: 'Sword of the Spirit',
    short: 'The Word',
    hue: 'var(--sword)',
    hex: '#ffe6a8',
    verse: 'Ephesians 6:17',
    key: '6',
    icon: 'sword',
    blurb: 'Sharpened by memorizing and applying specific Scriptures. It cuts through lies and temptations \u2014 but only the verse that fits the lie.',
    decays: 1.3,
    breach: 'Lies meet a dull blade. You know something is false but cannot answer it, so you argue instead of quoting.',
    restore: 'Draw the exact verse that answers the exact lie. Precision is the edge of the sword.',
    maintain: ['Memorize verses', 'Apply precisely', 'Answer lies with Scripture']
  },
  {
    id: 'prayer',
    name: 'Watchful Prayer',
    short: 'Prayer',
    hue: 'var(--prayer)',
    hex: '#ffc978',
    verse: '1 Peter 5:8',
    key: '7',
    icon: 'prayer',
    blurb: 'Spirit-led alertness. It powers the whole armor set, reveals hidden traps early, and lets you stand with others.',
    decays: 1.4,
    breach: 'The lights go out. Traps stay hidden until they spring, and you react to what you never saw coming.',
    restore: 'Pray before the pressure, not only during it. Alertness is a habit of the heart.',
    maintain: ['Pray first', 'Stay sober-minded', 'Watch for others']
  }
];

export const ARMOR_BY_ID = Object.fromEntries(ARMOR.map((a) => [a.id, a]));

export const ARMOR_ORDER = ARMOR.map((a) => a.id);
