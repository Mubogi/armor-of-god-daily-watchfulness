/**
 * Scripture library. Each verse is a collectible card AND the ammunition
 * that answers one specific category of lie (see `counters`).
 *
 * `counters` maps to THREAT kind ids in threats.js.
 */
export const SCRIPTURES = [
  {
    id: 'eph6-10',
    ref: 'Ephesians 6:10',
    text: 'Finally, be strong in the Lord and in the strength of his might.',
    note: 'Strength is not summoned from within; it is received from a Person.',
    counters: ['discouragement'],
    armor: 'faith',
    tier: 1
  },
  {
    id: 'eph6-11',
    ref: 'Ephesians 6:11',
    text: 'Put on the whole armor of God, that you may be able to stand against the schemes of the devil.',
    note: 'The armor is worn on purpose, piece by piece, before the battle starts.',
    counters: ['distraction'],
    armor: 'truth',
    tier: 1
  },
  {
    id: 'eph6-12',
    ref: 'Ephesians 6:12',
    text: 'For we do not wrestle against flesh and blood, but against the spiritual forces of evil.',
    note: 'People are never the enemy. This single verse disarms most offenses.',
    counters: ['offense'],
    armor: 'peace',
    tier: 1
  },
  {
    id: 'eph6-13',
    ref: 'Ephesians 6:13',
    text: 'Therefore take up the whole armor of God, that you may be able to withstand in the evil day, and having done all, to stand firm.',
    note: 'Some days you do not advance. Standing is the victory.',
    counters: ['despair'],
    armor: 'faith',
    tier: 1
  },
  {
    id: 'eph6-14a',
    ref: 'Ephesians 6:14',
    text: 'Stand therefore, having fastened on the belt of truth.',
    note: 'Truth is fastened, not held loosely. It is a decision repeated daily.',
    counters: ['deception'],
    armor: 'truth',
    tier: 1
  },
  {
    id: 'eph6-14b',
    ref: 'Ephesians 6:14',
    text: '\u2026and having put on the breastplate of righteousness.',
    note: 'Righteousness is put on as a gift. Condemnation cannot pierce what grace has covered.',
    counters: ['condemnation'],
    armor: 'righteousness',
    tier: 1
  },
  {
    id: 'eph6-15',
    ref: 'Ephesians 6:15',
    text: 'And, as shoes for your feet, having put on the readiness given by the gospel of peace.',
    note: 'Readiness is footing. Peace makes you able to move toward people, not away.',
    counters: ['panic'],
    armor: 'peace',
    tier: 1
  },
  {
    id: 'eph6-16',
    ref: 'Ephesians 6:16',
    text: 'In all circumstances take up the shield of faith, with which you can extinguish all the flaming darts of the evil one.',
    note: 'Darts are extinguished, not merely endured. Faith is the water on the flame.',
    counters: ['fear', 'doubt'],
    armor: 'faith',
    tier: 1
  },
  {
    id: 'eph6-17a',
    ref: 'Ephesians 6:17',
    text: 'And take the helmet of salvation.',
    note: 'The mind is guarded by remembering whose you are, not by proving what you can do.',
    counters: ['confusion'],
    armor: 'salvation',
    tier: 1
  },
  {
    id: 'eph6-17b',
    ref: 'Ephesians 6:17',
    text: '\u2026and the sword of the Spirit, which is the word of God.',
    note: 'One verse, well aimed, does more than a hundred arguments.',
    counters: ['temptation', 'rumor'],
    armor: 'sword',
    tier: 1
  },
  {
    id: 'eph6-18',
    ref: 'Ephesians 6:18',
    text: 'Praying at all times in the Spirit, with all prayer and supplication. To that end, keep alert with all perseverance.',
    note: 'Prayer is the atmosphere the rest of the armor breathes.',
    counters: ['fog'],
    armor: 'prayer',
    tier: 1
  },
  {
    id: '1pet5-8',
    ref: '1 Peter 5:8',
    text: 'Be sober-minded; be watchful. Your adversary the devil prowls around like a roaring lion, seeking someone to devour.',
    note: 'Watchfulness is not fear. It is clear-eyed love for your own soul.',
    counters: ['fog', 'temptation'],
    armor: 'prayer',
    tier: 1
  },
  {
    id: '1pet5-9',
    ref: '1 Peter 5:9',
    text: 'Resist him, firm in your faith, knowing that the same kinds of suffering are being experienced by your brotherhood throughout the world.',
    note: 'You are not the only one fighting. That knowledge is itself a shield.',
    counters: ['doubt', 'despair'],
    armor: 'faith',
    tier: 1
  },
  {
    id: '1pet5-10',
    ref: '1 Peter 5:10',
    text: 'And after you have suffered a little while, the God of all grace, who has called you to his eternal glory in Christ, will himself restore, confirm, strengthen, and establish you.',
    note: 'Suffering has a duration. Restoration has a Promise-keeper.',
    counters: ['despair', 'condemnation'],
    armor: 'salvation',
    tier: 2
  },
  {
    id: '2cor10-4',
    ref: '2 Corinthians 10:4',
    text: 'For the weapons of our warfare are not of the flesh but have divine power to destroy strongholds.',
    note: 'Fleshly weapons \u2014 sarcasm, silence, revenge \u2014 have no divine power.',
    counters: ['offense', 'temptation'],
    armor: 'sword',
    tier: 1
  },
  {
    id: '2cor10-5',
    ref: '2 Corinthians 10:5',
    text: 'We destroy arguments and every lofty opinion raised against the knowledge of God, and take every thought captive to obey Christ.',
    note: 'Thoughts are taken captive, not entertained. You are allowed to interrupt yourself.',
    counters: ['doubt', 'deception', 'rumor'],
    armor: 'truth',
    tier: 1
  },
  {
    id: 'phil4-6',
    ref: 'Philippians 4:6',
    text: 'Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.',
    note: 'Anxiety is answered with a specific activity: thankful, specific prayer.',
    counters: ['anxiety'],
    armor: 'prayer',
    tier: 1
  },
  {
    id: 'phil4-7',
    ref: 'Philippians 4:7',
    text: 'And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus.',
    note: 'Peace guards. It is a garrison, not a feeling.',
    counters: ['anxiety', 'panic'],
    armor: 'peace',
    tier: 1
  },
  {
    id: 'phil4-8',
    ref: 'Philippians 4:8',
    text: 'Whatever is true, whatever is honorable, whatever is just, whatever is pure, whatever is lovely, whatever is commendable, think about these things.',
    note: 'Attention is a discipline. The feed you choose becomes the mind you have.',
    counters: ['distraction', 'fog'],
    armor: 'salvation',
    tier: 2
  },
  {
    id: 'rom8-1',
    ref: 'Romans 8:1',
    text: 'There is therefore now no condemnation for those who are in Christ Jesus.',
    note: 'Not less condemnation. None. The verdict is already in.',
    counters: ['condemnation', 'shame'],
    armor: 'righteousness',
    tier: 1
  },
  {
    id: 'rom8-38',
    ref: 'Romans 8:38-39',
    text: 'For I am sure that neither death nor life, nor angels nor rulers, nor things present nor things to come\u2026 will be able to separate us from the love of God in Christ Jesus our Lord.',
    note: 'A list of everything that cannot break the bond. Read it slowly.',
    counters: ['despair', 'fear', 'doubt'],
    armor: 'faith',
    tier: 2
  },
  {
    id: 'isa41-10',
    ref: 'Isaiah 41:10',
    text: 'Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.',
    note: 'Four promises in one sentence. Fear has nowhere to stand.',
    counters: ['fear', 'anxiety'],
    armor: 'faith',
    tier: 1
  },
  {
    id: 'ps56-3',
    ref: 'Psalm 56:3',
    text: 'When I am afraid, I put my trust in you.',
    note: 'The verse does not say "if." It assumes fear and gives it a direction.',
    counters: ['fear'],
    armor: 'faith',
    tier: 1
  },
  {
    id: 'ps119-11',
    ref: 'Psalm 119:11',
    text: 'I have stored up your word in my heart, that I might not sin against you.',
    note: 'Memorization is storage for the moment you have no time to look it up.',
    counters: ['temptation', 'fog'],
    armor: 'sword',
    tier: 1
  },
  {
    id: 'james4-7',
    ref: 'James 4:7',
    text: 'Submit yourselves therefore to God. Resist the devil, and he will flee from you.',
    note: 'Resistance follows submission. You cannot push back what you have not bowed to.',
    counters: ['temptation', 'fear'],
    armor: 'sword',
    tier: 1
  },
  {
    id: '1cor10-13',
    ref: '1 Corinthians 10:13',
    text: 'God is faithful, and he will not let you be tempted beyond your ability, but with the temptation he will also provide the way of escape.',
    note: 'There is always an exit. Temptation always lies about that.',
    counters: ['temptation', 'despair'],
    armor: 'sword',
    tier: 2
  },
  {
    id: 'prov4-23',
    ref: 'Proverbs 4:23',
    text: 'Keep your heart with all vigilance, for from it flow the springs of life.',
    note: 'Vigilance over the heart is not paranoia. It is stewardship of a spring.',
    counters: ['distraction', 'deception'],
    armor: 'salvation',
    tier: 2
  },
  {
    id: 'prov15-1',
    ref: 'Proverbs 15:1',
    text: 'A soft answer turns away wrath, but a harsh word stirs up anger.',
    note: 'The soft answer is a tactic, not a surrender.',
    counters: ['offense', 'rumor'],
    armor: 'peace',
    tier: 1
  },
  {
    id: 'eph4-29',
    ref: 'Ephesians 4:29',
    text: 'Let no corrupting talk come out of your mouths, but only such as is good for building up, as fits the occasion.',
    note: 'Speech has a budget. Spend it on building.',
    counters: ['offense', 'rumor'],
    armor: 'truth',
    tier: 2
  },
  {
    id: 'eph4-32',
    ref: 'Ephesians 4:32',
    text: 'Be kind to one another, tenderhearted, forgiving one another, as God in Christ forgave you.',
    note: 'The measure of forgiveness is not the size of the offense but the size of the Cross.',
    counters: ['offense', 'bitterness'],
    armor: 'peace',
    tier: 1
  },
  {
    id: 'matt6-34',
    ref: 'Matthew 6:34',
    text: 'Therefore do not be anxious about tomorrow, for tomorrow will be anxious for itself. Sufficient for the day is its own trouble.',
    note: 'Grace is given per day. Borrowing tomorrow\u2019s trouble borrows without supply.',
    counters: ['anxiety', 'panic'],
    armor: 'prayer',
    tier: 1
  },
  {
    id: 'matt11-28',
    ref: 'Matthew 11:28',
    text: 'Come to me, all who labor and are heavy laden, and I will give you rest.',
    note: 'An invitation, not a performance review.',
    counters: ['despair', 'anxiety', 'shame'],
    armor: 'salvation',
    tier: 2
  },
  {
    id: 'gal2-20',
    ref: 'Galatians 2:20',
    text: 'I have been crucified with Christ. It is no longer I who live, but Christ who lives in me.',
    note: 'Identity is not what you produce. It is who holds you.',
    counters: ['confusion', 'shame'],
    armor: 'salvation',
    tier: 2
  },
  {
    id: '2tim1-7',
    ref: '2 Timothy 1:7',
    text: 'For God gave us a spirit not of fear but of power and love and self-control.',
    note: 'Self-control is a fruit of the Spirit, not a personality trait.',
    counters: ['fear', 'fog'],
    armor: 'prayer',
    tier: 2
  },
  {
    id: 'col3-2',
    ref: 'Colossians 3:2',
    text: 'Set your minds on things that are above, not on things that are on earth.',
    note: 'The mind drifts downward by default. Setting is an act of will.',
    counters: ['distraction', 'confusion'],
    armor: 'salvation',
    tier: 2
  },
  {
    id: 'john8-32',
    ref: 'John 8:32',
    text: 'And you will know the truth, and the truth will set you free.',
    note: 'Freedom is a byproduct of knowing, not of feeling unburdened.',
    counters: ['deception', 'rumor'],
    armor: 'truth',
    tier: 2
  },
  {
    id: '1john1-9',
    ref: '1 John 1:9',
    text: 'If we confess our sins, he is faithful and just to forgive us our sins and to cleanse us from all unrighteousness.',
    note: 'Confession is answered with cleansing, not with a lecture.',
    counters: ['shame', 'condemnation', 'deception'],
    armor: 'righteousness',
    tier: 1
  },
  {
    id: '1john4-4',
    ref: '1 John 4:4',
    text: 'He who is in you is greater than he who is in the world.',
    note: 'The comparison is not between your strength and the enemy\u2019s. It is between residents.',
    counters: ['fear', 'despair'],
    armor: 'faith',
    tier: 2
  },
  {
    id: 'ps46-1',
    ref: 'Psalm 46:1',
    text: 'God is our refuge and strength, a very present help in trouble.',
    note: 'Present tense help. Not a distant rescue plan.',
    counters: ['panic', 'anxiety', 'fear'],
    armor: 'faith',
    tier: 1
  },
  {
    id: 'isa26-3',
    ref: 'Isaiah 26:3',
    text: 'You keep him in perfect peace whose mind is stayed on you, because he trusts in you.',
    note: 'Peace is attached to the object of attention.',
    counters: ['anxiety', 'fog', 'confusion'],
    armor: 'peace',
    tier: 2
  },
  {
    id: 'gal5-1',
    ref: 'Galatians 5:1',
    text: 'For freedom Christ has set us free; stand firm therefore, and do not submit again to a yoke of slavery.',
    note: 'Freedom must be defended, or it quietly becomes a habit of return.',
    counters: ['temptation', 'shame'],
    armor: 'salvation',
    tier: 2
  },
  {
    id: 'heb12-1',
    ref: 'Hebrews 12:1-2',
    text: 'Let us lay aside every weight, and sin which clings so closely, and let us run with endurance the race that is set before us, looking to Jesus.',
    note: 'Weights are not always sins. Sometimes they are just what slows you down.',
    counters: ['fog', 'distraction', 'despair'],
    armor: 'faith',
    tier: 2
  },
  {
    id: 'ps4-8',
    ref: 'Psalm 4:8',
    text: 'In peace I will both lie down and sleep; for you alone, O LORD, make me dwell in safety.',
    note: 'Evening rest is an act of trust, not a lapse in vigilance.',
    counters: ['anxiety', 'fear'],
    armor: 'prayer',
    tier: 1
  },
  {
    id: 'lam3-22',
    ref: 'Lamentations 3:22-23',
    text: 'The steadfast love of the LORD never ceases; his mercies never come to an end; they are new every morning.',
    note: 'Yesterday\u2019s failure does not deplete today\u2019s supply.',
    counters: ['shame', 'condemnation', 'despair'],
    armor: 'righteousness',
    tier: 1
  },
  {
    id: 'mic6-8',
    ref: 'Micah 6:8',
    text: 'What does the LORD require of you but to do justice, and to love kindness, and to walk humbly with your God?',
    note: 'Three verbs. None of them is "impress."',
    counters: ['confusion', 'offense'],
    armor: 'truth',
    tier: 2
  },
  {
    id: '1cor13-4',
    ref: '1 Corinthians 13:4',
    text: 'Love is patient and kind; love does not envy or boast; it is not arrogant.',
    note: 'Read this at the moment you feel most wronged. It usually relocates the problem.',
    counters: ['offense', 'rumor', 'bitterness'],
    armor: 'peace',
    tier: 2
  },
  {
    id: 'eph4-27',
    ref: 'Ephesians 4:27',
    text: 'And give no opportunity to the devil.',
    note: 'Opportunity is usually small: an unguarded hour, an unspoken apology.',
    counters: ['distraction', 'temptation', 'fog'],
    armor: 'prayer',
    tier: 1
  },
  {
    id: 'prov3-5',
    ref: 'Proverbs 3:5-6',
    text: 'Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.',
    note: 'Straight paths are promised to acknowledged ways, not to fully understood plans.',
    counters: ['confusion', 'doubt', 'panic'],
    armor: 'faith',
    tier: 1
  }
];

export const SCRIPTURE_BY_ID = Object.fromEntries(SCRIPTURES.map((s) => [s.id, s]));

export const STARTING_VERSES = ['eph6-11', 'eph6-16', '1pet5-8', 'phil4-6'];

/** Verses that answer a given threat kind, strongest first. */
export function versesFor(kindId) {
  return SCRIPTURES.filter((s) => s.counters.includes(kindId));
}
