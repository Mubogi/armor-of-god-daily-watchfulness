/**
 * End-of-week debrief. Three discussion questions are drawn per playthrough,
 * weighted by what actually happened that week, so groups talk about their
 * own run rather than a generic list.
 */
export const DEBRIEF_QUESTIONS = {
  // Chosen when the player's weakest armor piece has a matching theme
  armor: {
    truth: {
      q: 'Where in your week did you tell a small lie to keep the peace \u2014 and what did it cost you later?',
      note: 'Read Ephesians 6:14 and Psalm 51:6 together.'
    },
    righteousness: {
      q: 'When you failed this week, did you run to God or hide from him? What made the difference?',
      note: 'Read Romans 8:1 and 1 John 1:9 aloud, slowly.'
    },
    peace: {
      q: 'Is there a person you have quietly stopped forgiving? What would releasing them cost you?',
      note: 'Read Ephesians 4:32 and Matthew 18:21-22.'
    },
    faith: {
      q: 'Which promise of God do you find hardest to believe when you are afraid, and why?',
      note: 'Read Isaiah 41:10 and mark every promise in it.'
    },
    salvation: {
      q: 'Where does your sense of identity come from on a bad day \u2014 Christ, or your performance?',
      note: 'Read Galatians 2:20 and Colossians 3:1-4.'
    },
    sword: {
      q: 'Which lie did you face this week that you did not have a verse for? What would you memorize?',
      note: 'Read Hebrews 4:12 and Psalm 119:11.'
    },
    prayer: {
      q: 'What would change if you prayed before the pressure instead of during it?',
      note: 'Read 1 Peter 5:8 and Ephesians 6:18.'
    }
  },
  // Chosen by gameplay pattern
  pattern: {
    manyBlocks: {
      q: 'You blocked most threats this week. Which one was hardest, and what made it different?',
      note: 'Celebrate progress, then name the next weak spot honestly.'
    },
    manyBreaches: {
      q: 'You took several hits this week. Which breach surprised you most \u2014 and what was the entry point?',
      note: 'Frame failure as data, not identity. Read Lamentations 3:22-23.'
    },
    fleshReactions: {
      q: 'You reacted in the flesh at least once. What was the feeling right before that choice?',
      note: 'Read James 1:19-20 and 2 Corinthians 10:5.'
    },
    scriptureUsed: {
      q: 'Which verse did you actually use under pressure? How did saying it change the moment?',
      note: 'Read that verse together and have each person say it from memory.'
    },
    lowDevotion: {
      q: 'Some days had almost no devotion time. What crowded it out \u2014 and was it a choice or a drift?',
      note: 'Read Ephesians 5:15-16 on making the best use of time.'
    },
    intercession: {
      q: 'You stood with someone else this week. Who is fighting a battle you could carry in prayer this week?',
      note: 'Read 1 Peter 5:9 and Galatians 6:2.'
    },
    perfectDay: {
      q: 'One day you stood fully armored. What did you do differently that morning?',
      note: 'Name the habit, not the feeling. Habits repeat.'
    }
  },
  // Always available closer
  closers: [
    {
      q: 'What is one specific, repeatable practice you will add to your morning this week?',
      note: 'Specific beats sincere. Write it down before you leave.'
    },
    {
      q: 'Who in this group can ask you about your weakest piece of armor next week?',
      note: 'Watchfulness is easier in pairs. Name a person, not a plan.'
    },
    {
      q: 'Where did you see God\u2019s grace this week that you did not earn?',
      note: 'End on grace, not on resolve. Read Romans 5:8.'
    }
  ]
};

export const DEBRIEF_VERSE = {
  ref: 'Ephesians 6:10-11',
  text: 'Finally, be strong in the Lord and in the strength of his might. Put on the whole armor of God, that you may be able to stand against the schemes of the devil.'
};

/** Rank thresholds on the weekly readiness score (0-100). */
export const RANKS = [
  { min: 92, name: 'Watchman of the Dawn', note: 'Sober-minded, prayerful, precise with the Word. You kept watch for others too.' },
  { min: 82, name: 'Steadfast Disciple', note: 'You held your ground and recovered quickly when you did not. Strong week.' },
  { min: 70, name: 'Faithful Learner', note: 'Real gains, real breaches. The armor is fitting better than it was on Day 1.' },
  { min: 55, name: 'Growing in Grace', note: 'You took hits, but you kept coming back to the Word and to prayer. That is the whole fight.' },
  { min: 38, name: 'Bruised but Standing', note: 'A hard week. The good news is that mercies are new tomorrow morning.' },
  { min: 0, name: 'Called Back to the Watch', note: 'The armor lay in the closet this week. It is not too late to put it back on.' }
];

export function rankFor(score) {
  return RANKS.find((r) => score >= r.min) || RANKS[RANKS.length - 1];
}
