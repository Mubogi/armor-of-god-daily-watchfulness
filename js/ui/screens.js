/** Full-screen views: title, mode select, how-to, briefing, planner, night, debrief. */
import { icon } from '../render/icons.js';
import { esc } from '../core/util.js';
import { ARMOR, ARMOR_BY_ID } from '../data/armor.js';
import { DEVOTIONS } from '../data/devotions.js';
import { MODE_LIST, PHASES } from '../data/modes.js';
import { SCRIPTURE_BY_ID } from '../data/scriptures.js';
import { rankFor, DEBRIEF_VERSE } from '../data/discussion.js';
import { armorAvg, mode } from '../core/state.js';

const verseCard = (v, opts = {}) => `
  <article class="verse-card ${opts.isNew ? 'is-new' : ''}" style="--accent: ${(ARMOR_BY_ID[v.armor] || {}).hex || '#e8c46a'}">
    <div class="verse-card__ref">${esc(v.ref)}</div>
    <blockquote class="verse-card__text">${esc(v.text)}</blockquote>
    <p class="verse-card__note">${esc(v.note)}</p>
  </article>
`;

export const Screens = {
  title({ hasSave, meta }) {
    const cont = hasSave
      ? `<button class="btn btn--primary btn--lg" data-act="continue">${icon('play', 18)} Continue the Watch</button>`
      : '';
    return `
      <section class="screen screen--centered">
        <div class="screen__inner">
          <div class="title-wrap">
            <div class="title-mark">${icon('shield', 34)}</div>
            <div class="eyebrow eyebrow--gold">Ephesians 6:10-18</div>
            <h1 class="title-main">Armor of God</h1>
            <div class="title-sub">Daily Watchfulness</div>
            <blockquote class="title-verse">
              &ldquo;Be sober-minded; be watchful. Your adversary the devil prowls around like a roaring lion,
              seeking someone to devour.&rdquo;
              <cite>1 Peter 5:8</cite>
            </blockquote>
            <p class="text-dim" style="max-width:560px">
              Seven days. Seven pieces of armor. One ordinary life full of ordinary pressure.
              Keep the armor bright, answer each attack with the right defense, and take every thought captive.
            </p>
            <div class="title-actions">
              ${cont}
              <button class="btn ${hasSave ? '' : 'btn--primary'} btn--lg" data-act="new">
                ${icon('flag', 18)} Begin a Week
              </button>
              <button class="btn btn--lg" data-act="howto">${icon('info', 18)} How to Play</button>
            </div>
            ${meta && meta.runsCompleted > 0 ? `
              <div class="row" style="justify-content:center;margin-top:var(--sp-4)">
                <span class="chip chip--gold">Best: ${meta.bestScore} &middot; ${esc(meta.bestRank || '-')}</span>
                <span class="chip">${meta.runsCompleted} week${meta.runsCompleted === 1 ? '' : 's'} completed</span>
              </div>` : ''}
          </div>
        </div>
      </section>
    `;
  },

  modeSelect(selectedId = 'growing') {
    return `
      <section class="screen screen--centered">
        <div class="screen__inner stack" style="align-items:center">
          <div class="center stack stack--sm">
            <div class="eyebrow eyebrow--gold">Choose your watch</div>
            <h2 style="font-size:var(--fs-2xl)">How much pressure can you stand?</h2>
            <p class="text-dim text-sm" style="max-width:520px">
              The armor is the same in every mode. Only the pace changes.
              You can start over at any time.
            </p>
          </div>
          <div class="mode-grid" role="radiogroup" aria-label="Difficulty">
            ${MODE_LIST.map((m) => `
              <button class="mode-card ${m.id === selectedId ? 'is-selected' : ''}" data-mode="${m.id}"
                      role="radio" aria-checked="${m.id === selectedId}">
                <div class="mode-card__name">${esc(m.name)}</div>
                <div class="text-xs text-gold" style="letter-spacing:.06em">${esc(m.tagline)}</div>
                <p class="mode-card__desc">${esc(m.desc)}</p>
                <div class="mode-card__stats">
                  ${m.chips.map((c) => `<span class="chip">${esc(c)}</span>`).join('')}
                </div>
              </button>
            `).join('')}
          </div>
          <div class="row mt-4">
            <button class="btn btn--ghost" data-act="back">Back</button>
            <button class="btn btn--primary btn--lg" data-act="start">${icon('play', 18)} Enter the Week</button>
          </div>
        </div>
      </section>
    `;
  },

  howto() {
    return `
      <section class="screen">
        <div class="screen__inner stack">
          <div class="row row--between">
            <div>
              <div class="eyebrow eyebrow--gold">Field Manual</div>
              <h2 style="font-size:var(--fs-2xl)">How to Play</h2>
            </div>
            <button class="btn btn--ghost" data-act="back">${icon('close', 16)} Close</button>
          </div>
          <div class="rules-grid">
            <div class="rule">
              <div class="rule__title">${icon('sun', 18)} 1 &middot; Morning Watch</div>
              <p>You have a limited attention budget each morning. Spend it on prayer, Scripture memory,
              confession, worship, reconciliation, service, or rest. What you choose raises specific armor
              pieces <em>and</em> slows their decay for the day.</p>
            </div>
            <div class="rule">
              <div class="rule__title">${icon('flame', 18)} 2 &middot; The Battle</div>
              <p>Pressures arrive as threats. Each one targets a specific weakness. Choose the armor piece that
              actually answers it, or speak the Scripture that cuts it. Wrong pieces cost you. Fleshly reactions
              cost more. Freezing costs most.</p>
            </div>
            <div class="rule">
              <div class="rule__title">${icon('book', 18)} 3 &middot; The Sword</div>
              <p>The sword only cuts with the <em>right</em> verse. A Scripture option you have not hidden yet will
              fumble &mdash; but it reveals the verse so you can learn it. Precision beats volume.</p>
            </div>
            <div class="rule">
              <div class="rule__title">${icon('moon', 18)} 4 &middot; Evening Examen</div>
              <p>Before the day closes, choose one examen act: examine, give thanks, forgive, repent, or review a verse.
              Then neglect decay applies. Armor left unused dulls.</p>
            </div>
            <div class="rule">
              <div class="rule__title">${icon('hands', 18)} 5 &middot; Stand With Others</div>
              <p>Intercession charges let you pray for a struggling brother or sister mid-battle. It strengthens your
              own weakest ground. Plan <em>Service &amp; Intercession</em> in the morning to earn more.</p>
            </div>
            <div class="rule">
              <div class="rule__title">${icon('target', 18)} 6 &middot; The Week</div>
              <p>Seven days, then a debrief with three discussion questions for youth or cell groups.
              Your week is scored on final armor, block rate, Scripture use, streaks, and fleshly reactions.</p>
            </div>
          </div>
          <div class="panel mt-4">
            <div class="panel__head"><h3 class="panel__title">Keyboard</h3></div>
            <div class="panel__body">
              <div class="row" style="gap:var(--sp-4)">
                <span class="text-sm text-dim"><kbd>1</kbd>-<kbd>7</kbd> raise an armor piece</span>
                <span class="text-sm text-dim"><kbd>A</kbd>-<kbd>D</kbd> pick a response option</span>
                <span class="text-sm text-dim"><kbd>Space</kbd> pause / continue</span>
                <span class="text-sm text-dim"><kbd>Esc</kbd> pause menu</span>
                <span class="text-sm text-dim"><kbd>L</kbd> scripture library</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  briefing(state) {
    const m = mode(state);
    const phase = PHASES[0];
    const verse = state.morningVerse ? SCRIPTURE_BY_ID[state.morningVerse] : null;
    return `
      <section class="screen screen--centered">
        <div class="brief">
          <div class="brief__head">
            <div class="eyebrow eyebrow--gold">${esc(m.name)}</div>
            <div class="brief__day">Day ${state.day} <span class="text-mute" style="font-size:.5em">of ${state.weekLength}</span></div>
            <div class="brief__phase">${esc(phase.label)} &middot; ${esc(phase.clock)}</div>
          </div>
          <div class="panel">
            <div class="panel__head">
              <h3 class="panel__title">${icon('sun', 15)} Today's Forecast</h3>
              <span class="chip">${m.threatsPerDay} threats expected</span>
            </div>
            <div class="panel__body">
              <p class="text-dim text-sm" style="margin-bottom:var(--sp-3)">
                The day will bring pressure. It always does. What you decide now &mdash; before the pressure &mdash; is what
                you will actually have to draw on later.
              </p>
              <div class="brief__forecast">
                ${ARMOR.slice(0, 4).map((a) => `
                  <div class="forecast-item" style="--accent:${a.hex}">
                    <span class="forecast-item__icon">${icon(a.icon, 15)}</span>
                    <span class="forecast-item__label">${esc(a.name)}</span>
                    <span class="forecast-item__value">${Math.round(state.armor[a.id])}%</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          ${verse ? `<div class="brief__verse">${verseCard(verse, { isNew: true })}</div>` : ''}
          <div class="brief__actions">
            <button class="btn btn--primary btn--lg" data-act="plan">${icon('prayer', 18)} Enter the Morning Watch</button>
            <button class="btn" data-act="pause">${icon('gear', 16)} Menu</button>
          </div>
        </div>
      </section>
    `;
  },

  planner(state) {
    const m = mode(state);
    const spent = Object.values(state.dayPlan).reduce((a, b) => a + b, 0);
    const left = m.budget - spent;
    return `
      <section class="screen">
        <div class="screen__inner stack">
          <div class="row row--between">
            <div>
              <div class="eyebrow eyebrow--gold">Day ${state.day} &middot; Morning Watch</div>
              <h2 style="font-size:var(--fs-2xl)">Spend your attention</h2>
              <p class="text-dim text-sm" style="margin-top:6px;max-width:520px">
                Every slot you spend here strengthens armor and slows its decay today.
                Nothing spent here is neutral &mdash; unspent attention drifts.
              </p>
            </div>
            <div class="planner__budget" style="min-width:180px">
              <div>
                <div class="eyebrow">Attention</div>
                <strong data-left>${left}</strong>
              </div>
              <span class="text-xs text-mute">of ${m.budget} slots</span>
            </div>
          </div>
          <div class="planner">
            ${DEVOTIONS.map((d) => {
              const used = state.dayPlan[d.id] || 0;
              const atMax = used >= d.max;
              const gainList = Object.entries(d.gains)
                .map(([k, v]) => `<span class="chip" style="border-color:${(ARMOR_BY_ID[k] || {}).hex}44">${esc((ARMOR_BY_ID[k] || {}).short || k)} +${v}</span>`)
                .join('');
              return `
                <div class="planner__row ${atMax ? 'is-max' : ''} ${used === 0 ? 'is-zero' : ''}"
                     data-dev="${d.id}" style="--accent:${d.accent}">
                  <span class="planner__icon">${icon(d.icon, 18)}</span>
                  <div>
                    <div class="planner__label">${esc(d.name)}</div>
                    <div class="planner__hint">${esc(d.hint)}</div>
                    <div class="row" style="gap:6px;margin-top:6px">${gainList}</div>
                  </div>
                  <div class="stepper">
                    <button class="stepper__btn" data-dev-dec="${d.id}" ${used === 0 ? 'disabled' : ''} aria-label="Remove ${esc(d.name)}">&minus;</button>
                    <span class="stepper__val" data-dev-val="${d.id}">${used}</span>
                    <button class="stepper__btn" data-dev-inc="${d.id}" ${atMax || left <= 0 ? 'disabled' : ''} aria-label="Add ${esc(d.name)}">+</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <div class="row row--between mt-4">
            <button class="btn btn--ghost" data-act="pause">${icon('gear', 16)} Menu</button>
            <button class="btn btn--primary btn--lg" data-act="commit">
              ${icon('check', 18)} Begin the Day
            </button>
          </div>
        </div>
      </section>
    `;
  },

  night(state, summary) {
    const { dayStats, decay, reward } = summary;
    const rewardVerse = reward ? SCRIPTURE_BY_ID[reward.id] : null;
    return `
      <section class="screen screen--centered">
        <div class="brief">
          <div class="brief__head">
            <div class="eyebrow eyebrow--gold">Day ${state.day} complete</div>
            <div class="brief__day">Evening Examen</div>
            <div class="brief__phase">21:00 &middot; Rest</div>
          </div>
          <div class="panel">
            <div class="panel__head"><h3 class="panel__title">${icon('moon', 15)} The Day, Reviewed</h3></div>
            <div class="panel__body stack stack--sm">
              <div class="debrief__grid">
                <div class="debrief__stat"><b>${dayStats.blocked}</b><span>stood firm</span></div>
                <div class="debrief__stat"><b>${dayStats.breached}</b><span>breaches</span></div>
                <div class="debrief__stat"><b>${Math.round(armorAvg(state))}%</b><span>armor</span></div>
              </div>
              <hr class="divider" />
              <div>
                <div class="eyebrow" style="margin-bottom:8px">Neglect decay</div>
                <div class="delta-row">
                  ${Object.entries(decay).filter(([, v]) => v < -0.05).map(([k, v]) => `
                    <span class="delta delta--down">${esc((ARMOR_BY_ID[k] || {}).short || k)} ${v.toFixed(1)}</span>
                  `).join('') || '<span class="text-mute text-sm">Nothing decayed. Unusual and good.</span>'}
                </div>
              </div>
              ${rewardVerse ? `
                <hr class="divider" />
                <div>
                  <div class="eyebrow" style="margin-bottom:8px">A verse for tomorrow</div>
                  ${verseCard(rewardVerse, { isNew: true })}
                </div>` : ''}
            </div>
          </div>
          <div class="brief__actions">
            <button class="btn btn--primary btn--lg" data-act="next-day">
              ${state.day >= state.weekLength ? 'See the Week Debrief' : `Begin Day ${state.day + 1}`}
              ${icon('chevron', 18)}
            </button>
          </div>
        </div>
      </section>
    `;
  },

  debrief(state, summary, questions) {
    const rank = rankFor(summary.score);
    return `
      <section class="screen">
        <div class="screen__inner">
          <div class="debrief">
            <div class="debrief__hero">
              <div class="eyebrow eyebrow--gold">Week Complete &middot; ${esc(mode(state).name)}</div>
              <div class="debrief__score">${summary.score}<small> / 100</small></div>
              <div class="debrief__rank">${esc(rank.name)}</div>
              <p class="text-dim text-sm" style="max-width:560px;margin:8px auto 0">${esc(rank.note)}</p>
            </div>

            <div class="debrief__grid">
              <div class="debrief__stat"><b>${summary.finalArmor}%</b><span>final armor</span></div>
              <div class="debrief__stat"><b>${summary.blockRate}%</b><span>threats held</span></div>
              <div class="debrief__stat"><b>${summary.scriptureStrikes}</b><span>scripture strikes</span></div>
              <div class="debrief__stat"><b>${summary.bestStreak}</b><span>best streak</span></div>
              <div class="debrief__stat"><b>${summary.perfectDays}</b><span>clean days</span></div>
              <div class="debrief__stat"><b>${summary.intercessions}</b><span>intercessions</span></div>
            </div>

            <div class="panel">
              <div class="panel__head">
                <h3 class="panel__title">${icon('users', 15)} Group Discussion</h3>
                <span class="chip chip--gold">3 questions</span>
              </div>
              <div class="panel__body">
                <div class="questions">
                  ${questions.map((q) => `
                    <div class="question">
                      <div><p>${esc(q.q)}</p><small>${esc(q.note)}</small></div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <div class="panel">
              <div class="panel__head"><h3 class="panel__title">${icon('book', 15)} Closing Charge</h3></div>
              <div class="panel__body">
                ${verseCard({ ...DEBRIEF_VERSE, note: 'The armor is not for a season. Put it on again tomorrow.', armor: 'faith' })}
              </div>
            </div>

            <div class="panel">
              <div class="panel__head"><h3 class="panel__title">${icon('shield', 15)} Your Armor at Week's End</h3></div>
              <div class="panel__body">
                <div class="stack stack--sm">
                  ${ARMOR.map((a) => `
                    <div class="row row--between" style="gap:var(--sp-3)">
                      <span class="row" style="gap:8px;flex:1;min-width:0">
                        <span style="color:${a.hex};display:grid;place-items:center">${icon(a.icon, 15)}</span>
                        <span class="text-sm">${esc(a.name)}</span>
                      </span>
                      <span class="gauge__bar" style="width:120px;flex:0 0 auto">
                        <span class="gauge__fill" style="width:${Math.round(state.armor[a.id])}%;--hue:${a.hue}"></span>
                      </span>
                      <span class="text-xs text-mute" style="width:34px;text-align:right">${Math.round(state.armor[a.id])}%</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <div class="row" style="justify-content:center;gap:var(--sp-3);flex-wrap:wrap">
              <button class="btn btn--primary btn--lg" data-act="new">${icon('flag', 18)} Begin Another Week</button>
              <button class="btn" data-act="codex">${icon('book', 16)} Scripture Library</button>
              <button class="btn btn--ghost" data-act="title">${icon('chevron', 16)} Title Screen</button>
            </div>
          </div>
        </div>
      </section>
    `;
  }
};

export { verseCard };
