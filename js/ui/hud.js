/** Readiness HUD: total ring, seven armor gauges, topbar, and the response tray. */
import { ARMOR, ARMOR_BY_ID } from '../data/armor.js';
import { icon } from '../render/icons.js';
import { esc } from '../core/util.js';
import { armorAvg, mode } from '../core/state.js';

const RING_R = 26;
const RING_C = 2 * Math.PI * RING_R;

export class Hud {
  constructor(root) {
    this.root = root;
    this.prev = {};
    this.mounted = false;
    this.build();
  }

  build() {
    this.root.innerHTML = `
      <div class="hud">
        <div class="readiness-total">
          <div class="readiness-total__ring">
            <svg width="62" height="62" viewBox="0 0 62 62" aria-hidden="true">
              <circle cx="31" cy="31" r="${RING_R}" fill="none" stroke="rgba(160,186,240,0.12)" stroke-width="5"/>
              <circle class="readiness-total__arc" cx="31" cy="31" r="${RING_R}" fill="none"
                stroke="url(#ringGrad)" stroke-width="5" stroke-linecap="round"
                stroke-dasharray="${RING_C}" stroke-dashoffset="${RING_C}"
                transform="rotate(-90 31 31)"/>
              <defs>
                <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#a9803a"/>
                  <stop offset="55%" stop-color="#e8c46a"/>
                  <stop offset="100%" stop-color="#ffdd8c"/>
                </linearGradient>
              </defs>
            </svg>
            <div class="readiness-total__num">0</div>
          </div>
          <div class="readiness-total__meta">
            <span class="readiness-total__label">Total Readiness</span>
            <span class="readiness-total__state">Dressing</span>
            <span class="text-xs text-mute readiness-total__streak"></span>
          </div>
        </div>
        <div class="hud__head">
          <span class="hud__title">Armor</span>
          <button class="btn btn--ghost btn--sm" data-act="codex" title="Scripture library">
            ${icon('book', 14)} <span class="text-xs">Library</span>
          </button>
        </div>
        <div class="gauge-list" role="list"></div>
        <button class="btn btn--ghost btn--sm btn--blok mt-4" data-act="intercede">
          ${icon('hands', 14)} <span>Intercede</span>
          <span class="chip chip--gold intercede-count">0</span>
        </button>
      </div>
    `;
    this.arc = this.root.querySelector('.readiness-total__arc');
    this.num = this.root.querySelector('.readiness-total__num');
    this.stateEl = this.root.querySelector('.readiness-total__state');
    this.streakEl = this.root.querySelector('.readiness-total__streak');
    this.list = this.root.querySelector('.gauge-list');
    this.intercedeBtn = this.root.querySelector('[data-act="intercede"]');
    this.intercedeCount = this.root.querySelector('.intercede-count');

    this.list.innerHTML = ARMOR.map((a) => `
      <div class="gauge" data-armor="${a.id}" style="--hue: ${a.hue}" role="listitem"
           title="${esc(a.blurb)}">
        <div class="gauge__icon">${icon(a.icon, 15)}</div>
        <div class="gauge__main">
          <div class="gauge__top">
            <span class="gauge__name">${esc(a.short)}</span>
            <span class="gauge__val" data-val="${a.id}">0</span>
          </div>
          <div class="gauge__bar"><div class="gauge__fill" data-fill="${a.id}" style="width:0%"></div></div>
        </div>
        <span class="gauge__trend" data-trend="${a.id}"></span>
      </div>
    `).join('');

    this.gauges = {};
    for (const a of ARMOR) {
      this.gauges[a.id] = {
        row: this.list.querySelector(`[data-armor="${a.id}"]`),
        fill: this.list.querySelector(`[data-fill="${a.id}"]`),
        val: this.list.querySelector(`[data-val="${a.id}"]`),
        trend: this.list.querySelector(`[data-trend="${a.id}"]`)
      };
    }
  }

  update(state, opts = {}) {
    const avg = armorAvg(state);
    const frac = Math.max(0, Math.min(1, avg / 100));
    this.arc.style.strokeDashoffset = String(RING_C * (1 - frac));
    this.num.textContent = String(Math.round(avg));
    this.stateEl.textContent = readinessLabel(avg);
    this.streakEl.textContent = state.streak > 0 ? `${state.streak} stood firm in a row` : '';

    for (const a of ARMOR) {
      const g = this.gauges[a.id];
      const level = state.armor[a.id];
      g.fill.style.width = `${Math.max(0, Math.min(100, level))}%`;
      g.val.textContent = String(Math.round(level));

      const before = this.prev[a.id];
      if (before !== undefined && Math.abs(before - level) >= 0.5) {
        const diff = level - before;
        g.trend.textContent = `${diff > 0 ? '+' : ''}${Math.round(diff)}`;
        g.trend.className = `gauge__trend ${diff > 0 ? 'gauge__trend--up' : 'gauge__trend--down'}`;
        g.row.classList.remove('is-flashing');
        void g.row.offsetWidth;
        g.row.classList.add('is-flashing');
      }
      this.prev[a.id] = level;

      g.row.classList.toggle('is-critical', level < 25);
      const targeted = opts.targeted && opts.targeted.includes(a.id);
      g.row.classList.toggle('is-targeted', Boolean(targeted));
    }

    const charges = state.intercessionCharges;
    this.intercedeCount.textContent = String(charges);
    this.intercedeBtn.disabled = charges <= 0;
    this.intercedeBtn.setAttribute('aria-disabled', String(charges <= 0));
    this.intercedeBtn.title = charges > 0
      ? `Pray for someone else's battle (${charges} left)`
      : 'No intercession charges — plan Service & Intercession in the morning';
  }

  resetTrends() {
    this.prev = {};
  }
}

export function readinessLabel(avg) {
  if (avg >= 92) return 'Battle Ready';
  if (avg >= 80) return 'Standing Firm';
  if (avg >= 65) return 'Watchful';
  if (avg >= 48) return 'Weakening';
  if (avg >= 30) return 'Exposed';
  if (avg >= 15) return 'Barely Armored';
  return 'Unarmored';
}

/** Topbar with day, clock, grace, verses, streak, and pause. */
export class Topbar {
  constructor(root) {
    this.root = root;
    this.root.className = 'topbar battle-topbar';
    this.root.innerHTML = `
      <div class="topbar__group">
        <div class="day-badge">
          <span class="day-badge__label">Day</span>
          <span class="day-badge__value"><span data-day>1</span><span class="text-mute" style="font-size:.7em">/7</span></span>
        </div>
        <div class="clock">
          <span class="clock__icon">${icon('clock', 15)}</span>
          <span class="clock__text" data-clock>06:00</span>
          <span class="clock__phase" data-phase>Morning</span>
        </div>
      </div>
      <div class="topbar__sep"></div>
      <div class="topbar__group">
        <span class="stat" title="Grace tokens earned by faithful responses">
          <span class="stat__icon text-gold">${icon('spark', 15)}</span>
          <strong data-grace>0</strong><span class="text-xs text-mute">grace</span>
        </span>
        <span class="stat" title="Scriptures hidden in your heart">
          <span class="stat__icon" style="color:var(--sword)">${icon('book', 15)}</span>
          <strong data-verses>0</strong><span class="text-xs text-mute">verses</span>
        </span>
        <span class="stat" title="Consecutive threats answered rightly">
          <span class="stat__icon" style="color:var(--jade)">${icon('flame', 15)}</span>
          <strong data-streak>0</strong><span class="text-xs text-mute">streak</span>
        </span>
      </div>
      <div class="topbar__spacer"></div>
      <div class="topbar__group">
        <button class="btn btn--ghost btn--sm" data-act="pause" title="Pause menu (Esc)">
          ${icon('gear', 16)}
        </button>
      </div>
    `;
    this.day = this.root.querySelector('[data-day]');
    this.clock = this.root.querySelector('[data-clock]');
    this.phase = this.root.querySelector('[data-phase]');
    this.grace = this.root.querySelector('[data-grace]');
    this.verses = this.root.querySelector('[data-verses]');
    this.streak = this.root.querySelector('[data-streak]');
  }

  update(state, clockText, phaseLabel) {
    this.day.textContent = String(Math.min(state.day, state.weekLength));
    if (clockText) this.clock.textContent = clockText;
    if (phaseLabel) this.phase.textContent = phaseLabel;
    this.grace.textContent = String(state.grace);
    this.verses.textContent = String(state.verses.length);
    this.streak.textContent = String(state.streak);
  }
}

/** Response tray: the seven armor buttons + scripture + prayer shortcuts. */
export class Tray {
  constructor(root, onAction) {
    this.root = root;
    this.root.className = 'tray battle-tray';
    this.onAction = onAction;
    this.armed = null;
    this.root.innerHTML = ARMOR.map((a) => `
      <button class="action" data-armor="${a.id}" style="--hue: ${a.hue}"
              aria-label="${esc(a.name)}">
        <span class="action__key">${a.key}</span>
        <span class="action__icon">${icon(a.icon, 22)}</span>
        <span class="action__label">${esc(a.short)}</span>
      </button>
    `).join('');
    this.buttons = {};
    for (const a of ARMOR) {
      const btn = this.root.querySelector(`[data-armor="${a.id}"]`);
      this.buttons[a.id] = btn;
      btn.addEventListener('click', () => this.onAction && this.onAction(a.id));
    }
  }

  setEnabled(enabled) {
    for (const id of Object.keys(this.buttons)) {
      this.buttons[id].disabled = !enabled;
    }
  }

  arm(armorId) {
    this.armed = armorId;
    for (const [id, btn] of Object.entries(this.buttons)) {
      btn.classList.toggle('is-arming', id === armorId);
      btn.classList.toggle('is-ready', id === armorId);
    }
  }

  clearArm() {
    this.armed = null;
    for (const btn of Object.values(this.buttons)) {
      btn.classList.remove('is-arming', 'is-ready');
    }
  }

  markCorrect(armorId) {
    const btn = this.buttons[armorId];
    if (btn) btn.classList.add('is-ready');
  }
}

export { ARMOR_BY_ID, mode };
