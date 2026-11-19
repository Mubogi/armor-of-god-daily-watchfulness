/** Modal system: threat encounters, results, library, pause menu, evening examen. */
import { icon } from '../render/icons.js';
import { esc } from '../core/util.js';
import { ARMOR, ARMOR_BY_ID } from '../data/armor.js';
import { SCRIPTURES, SCRIPTURE_BY_ID } from '../data/scriptures.js';
import { EVENING_ACTS } from '../data/devotions.js';
import { FAMILY_META } from '../data/threats.js';

export class Modals {
  constructor(host) {
    this.host = host;
    this.stack = [];
    this.onClose = null;
    host.addEventListener('click', (e) => {
      if (e.target === host && this.closable) this.close();
    });
  }

  get isOpen() {
    return this.stack.length > 0;
  }

  mount({ eyebrow, title, sub, body, foot, wide = false, closable = true, onMount }) {
    this.closable = closable;
    const modal = document.createElement('div');
    modal.className = `modal ${wide ? 'modal--wide' : ''}`;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <header class="modal__head">
        <div class="modal__titles">
          ${eyebrow ? `<div class="modal__eyebrow">${eyebrow}</div>` : ''}
          <h2 class="modal__title">${title}</h2>
          ${sub ? `<div class="modal__sub">${sub}</div>` : ''}
        </div>
        ${closable ? `<button class="modal__close" data-close aria-label="Close">${icon('close', 16)}</button>` : ''}
      </header>
      <div class="modal__body">${body}</div>
      ${foot ? `<footer class="modal__foot">${foot}</footer>` : ''}
    `;
    this.host.innerHTML = '';
    this.host.append(modal);
    this.host.classList.add('is-open');
    this.modal = modal;
    this.stack.push(modal);

    const closeBtn = modal.querySelector('[data-close]');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    if (onMount) onMount(modal);
    // Focus the first meaningful control for keyboard users
    const focusTarget = modal.querySelector('[data-autofocus]') || modal.querySelector('.modal__foot .btn') || modal.querySelector('.modal__close');
    if (focusTarget) focusTarget.focus({ preventScroll: true });
    return modal;
  }

  close() {
    this.host.classList.remove('is-open');
    this.host.innerHTML = '';
    this.stack = [];
    this.modal = null;
    if (this.onClose) {
      const cb = this.onClose;
      this.onClose = null;
      cb();
    }
  }

  /* ---------- Threat encounter ---------- */

  encounter({ encounter, onChoose, state, onIntercede }) {
    const th = encounter.threat;
    const fam = FAMILY_META[th.family] || FAMILY_META.storm;
    const targets = th.targets.map((id) => ARMOR_BY_ID[id].name).join(' and ');
    const keys = ['A', 'B', 'C', 'D'];

    const body = `
      <div class="threat-prompt">
        <div class="threat-prompt__tag" style="color:${fam.hex};border-color:${fam.hex}55;background:${fam.hex}18">
          ${esc(fam.label)} &middot; Threat ${encounter.index + 1}
        </div>
        <h3 class="threat-prompt__title">${esc(th.name)}</h3>
        <p class="threat-prompt__body">${esc(th.blurb)}</p>
        <div class="threat-prompt__target">
          ${icon('target', 15)}
          <span>${encounter.trapHidden
            ? 'Targeting: <strong>concealed</strong> &mdash; watchfulness too low to see it'
            : `Targeting: <strong>${esc(targets)}</strong>`}</span>
        </div>
        <div class="timer">
          <span class="text-xs text-mute">${icon('clock', 12)}</span>
          <div class="timer__track"><div class="timer__fill" data-timer-fill></div></div>
          <span class="timer__label" data-timer-label>${encounter.window.toFixed(1)}s</span>
        </div>
        <div class="options" data-options>
          ${encounter.options.map((o, i) => {
            const hue = optionHue(o);
            const lock = o.type === 'scripture' && !o.owned;
            return `
              <button class="option ${o.type === 'flesh' ? 'option--flesh' : ''}" data-opt="${i}" style="--hue:${hue}">
                <span class="option__icon">${icon(optionIcon(o), 16)}</span>
                <span class="option__text">
                  <span class="option__label">${esc(o.label)}${lock ? ' (not yet hidden)' : ''}</span>
                  <span class="option__hint">${esc(o.hint)}</span>
                </span>
                <span class="option__key">${keys[i]}</span>
              </button>
            `;
          }).join('')}
        </div>
        <div class="row row--between" style="margin-top:var(--sp-3);gap:var(--sp-2)">
          <p class="text-xs text-mute" style="flex:1;min-width:0;margin:0">
            ${encounter.trapHidden
              ? 'Watchfulness is low &mdash; one option is camouflaged until prayer rises.'
              : 'Choose the piece that actually answers this attack, not the one that feels related.'}
          </p>
          <button class="btn btn--sm" data-intercede
                  ${state.intercessionCharges <= 0 ? 'disabled aria-disabled="true"' : ''}
                  title="Stand with a brother or sister in prayer">
            ${icon('hands', 14)} Intercede
            <span class="chip chip--gold">${state.intercessionCharges}</span>
          </button>
        </div>
      </div>
    `;

    return this.mount({
      eyebrow: `Day ${state.day} &middot; ${esc(th.family)}`,
      title: 'Incoming',
      sub: `&ldquo;${esc(th.whisper)}&rdquo;`,
      body,
      closable: false,
      onMount: (modal) => {
        modal.querySelectorAll('[data-opt]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const opt = encounter.options[Number(btn.dataset.opt)];
            onChoose(opt);
          });
        });
        const ib = modal.querySelector('[data-intercede]');
        if (ib && onIntercede) ib.addEventListener('click', onIntercede);
      }
    });
  }

  /* ---------- Result reveal ---------- */

  result({ result, encounter, onContinue, isLast }) {
    const tone = result.tone === 'good' ? 'good' : result.tone === 'mixed' ? 'mixed' : 'bad';
    const bannerIcon = tone === 'good' ? 'check' : tone === 'mixed' ? 'info' : 'x';
    const deltas = Object.entries(result.deltas || {})
      .filter(([, v]) => Math.abs(v) >= 0.5)
      .map(([k, v]) => {
        const meta = ARMOR_BY_ID[k];
        return `<span class="delta ${v > 0 ? 'delta--up' : 'delta--down'}">
          ${esc(meta ? meta.short : k)} ${v > 0 ? '+' : ''}${Math.round(v)}
        </span>`;
      }).join('');

    const verseNote = result.verseId && result.strike
      ? `<div class="verse-card" style="--accent:${ARMOR_BY_ID[SCRIPTURE_BY_ID[result.verseId].armor].hex};margin-top:var(--sp-2)">
           <div class="verse-card__ref">${esc(SCRIPTURE_BY_ID[result.verseId].ref)}</div>
           <blockquote class="verse-card__text">${esc(SCRIPTURE_BY_ID[result.verseId].text)}</blockquote>
         </div>`
      : '';
    const revealNote = result.revealsVerse
      ? `<p class="text-sm text-gold" style="margin-top:var(--sp-2)">${icon('book', 14)} Verse added to your library: <strong>${esc(SCRIPTURE_BY_ID[result.revealsVerse].ref)}</strong></p>`
      : '';

    return this.mount({
      eyebrow: tone === 'good' ? 'Held' : tone === 'mixed' ? 'Partial' : 'Breached',
      title: esc(result.title),
      body: `
        <div class="result">
          <div class="result__banner result__banner--${tone}">
            <span style="color:var(--${tone === 'good' ? 'ok' : tone === 'mixed' ? 'warn' : 'bad'})">${icon(bannerIcon, 22)}</span>
            <div>
              <h3>${esc(encounter.threat.name)}</h3>
              <p>${esc(result.body)}</p>
            </div>
          </div>
          ${deltas ? `<div class="delta-row">${deltas}</div>` : ''}
          ${result.grace ? `<p class="text-sm text-gold">${icon('spark', 14)} +${result.grace} grace</p>` : ''}
          ${verseNote}
          ${revealNote}
        </div>
      `,
      foot: `<button class="btn btn--primary" data-continue data-autofocus>
        ${isLast ? 'Finish the Day' : 'Next Threat'} ${icon('chevron', 16)}
      </button>`,
      closable: false,
      onMount: (modal) => {
        modal.querySelector('[data-continue]').addEventListener('click', onContinue);
      }
    });
  }

  /* ---------- Scripture library ---------- */

  library({ state, onClose }) {
    const owned = new Set(state.verses);
    const sorted = [...SCRIPTURES].sort((a, b) => {
      const ao = owned.has(a.id) ? 0 : 1;
      const bo = owned.has(b.id) ? 0 : 1;
      return ao - bo;
    });
    const body = `
      <p class="text-sm text-dim" style="margin-bottom:var(--sp-3)">
        ${owned.size} of ${SCRIPTURES.length} hidden in your heart. Verses you own can be spoken in battle;
        the rest appear as locked options until you learn them.
      </p>
      <div class="verse-grid">
        ${sorted.map((v) => {
          const has = owned.has(v.id);
          const meta = ARMOR_BY_ID[v.armor] || {};
          return `
            <article class="verse-card ${has ? '' : 'verse-card--locked'}" style="--accent:${meta.hex || '#e8c46a'}">
              <div class="verse-card__ref">${esc(v.ref)} ${has ? '' : '&middot; locked'}</div>
              <blockquote class="verse-card__text">${has ? esc(v.text) : '&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;'}</blockquote>
              <p class="verse-card__note">${has ? esc(v.note) : `Answers: ${v.counters.join(', ')}`}</p>
            </article>
          `;
        }).join('')}
      </div>
    `;
    return this.mount({
      eyebrow: 'The Sword of the Spirit',
      title: 'Scripture Library',
      sub: 'Memorize precisely. The blade only cuts with the right verse.',
      body,
      wide: true,
      foot: `<button class="btn btn--primary" data-close2 data-autofocus>Close</button>`,
      onMount: (modal) => {
        modal.querySelector('[data-close2]').addEventListener('click', onClose);
      }
    });
  }

  /* ---------- Evening examen ---------- */

  evening({ state, onChoose }) {
    const body = `
      <p class="text-dim" style="margin-bottom:var(--sp-3)">
        The day is nearly over. Choose one act of examen before you sleep.
        What you notice tonight shapes what you are watchful for tomorrow.
      </p>
      <div class="options">
        ${EVENING_ACTS.map((a, i) => `
          <button class="option" data-act-id="${a.id}" style="--hue:${a.accent}">
            <span class="option__icon">${icon(a.icon, 16)}</span>
            <span class="option__text">
              <span class="option__label">${esc(a.name)}</span>
              <span class="option__hint">${esc(a.hint)}</span>
            </span>
            <span class="option__key">${i + 1}</span>
          </button>
        `).join('')}
      </div>
    `;
    return this.mount({
      eyebrow: `Day ${state.day} &middot; 21:00`,
      title: 'Evening Examen',
      body,
      closable: false,
      onMount: (modal) => {
        modal.querySelectorAll('[data-act-id]').forEach((btn) => {
          btn.addEventListener('click', () => onChoose(btn.dataset.actId));
        });
      }
    });
  }

  /* ---------- Intercession ---------- */

  intercession({ state, onConfirm, onCancel }) {
    const body = `
      <p class="text-dim">
        You have <strong class="text-gold">${state.intercessionCharges}</strong> intercession charge${state.intercessionCharges === 1 ? '' : 's'} left.
      </p>
      <div class="panel" style="margin-top:var(--sp-3)">
        <div class="panel__body">
          <p class="text-sm">
            <strong class="text-gold">Standing with others.</strong>
            Praying for a struggling brother or sister widens your own protection &mdash;
            faith, prayer, and peace rise, and the enemy's focus on you weakens.
          </p>
          <p class="text-sm text-mute" style="margin-top:var(--sp-2)">
            &ldquo;Resist him, firm in your faith, knowing that the same kinds of suffering are being
            experienced by your brotherhood throughout the world.&rdquo; &mdash; 1 Peter 5:9
          </p>
        </div>
      </div>
    `;
    return this.mount({
      eyebrow: 'Intercession Shield',
      title: 'Pray for another',
      body,
      foot: `
        <button class="btn btn--ghost" data-cancel>Not now</button>
        <button class="btn btn--primary" data-confirm data-autofocus>${icon('hands', 16)} Pray for them</button>
      `,
      onMount: (modal) => {
        modal.querySelector('[data-confirm]').addEventListener('click', onConfirm);
        modal.querySelector('[data-cancel]').addEventListener('click', onCancel);
      }
    });
  }

  /* ---------- Pause menu ---------- */

  pause({ state, meta, on }) {
    const body = `
      <div class="menu-list">
        <button class="menu-item" data-m="resume">
          <span class="menu-item__icon">${icon('play', 18)}</span>
          <span class="menu-item__text">
            <span class="menu-item__label">Resume</span>
            <span class="menu-item__hint">Back to the day</span>
          </span>
        </button>
        <button class="menu-item" data-m="library">
          <span class="menu-item__icon">${icon('book', 18)}</span>
          <span class="menu-item__text">
            <span class="menu-item__label">Scripture Library</span>
            <span class="menu-item__hint">${state.verses.length} verses hidden</span>
          </span>
        </button>
        <button class="menu-item" data-m="save">
          <span class="menu-item__icon">${icon('save', 18)}</span>
          <span class="menu-item__text">
            <span class="menu-item__label">Save &amp; Exit</span>
            <span class="menu-item__hint">Progress is saved automatically too</span>
          </span>
        </button>
        <button class="menu-item" data-m="restart">
          <span class="menu-item__icon">${icon('flag', 18)}</span>
          <span class="menu-item__text">
            <span class="menu-item__label">Restart the Week</span>
            <span class="menu-item__hint">Abandon this run and start over</span>
          </span>
        </button>
      </div>
    `;
    return this.mount({
      eyebrow: `Day ${state.day} &middot; ${esc(state.modeId)}`,
      title: 'Paused',
      sub: meta && meta.bestScore ? `Best week so far: ${meta.bestScore} &middot; ${esc(meta.bestRank)}` : '',
      body,
      foot: `<button class="btn btn--ghost" data-close3>Close</button>`,
      onMount: (modal) => {
        modal.querySelector('[data-close3]').addEventListener('click', () => this.close());
        modal.querySelector('[data-m="resume"]').addEventListener('click', () => this.close());
        modal.querySelector('[data-m="library"]').addEventListener('click', () => on.library());
        modal.querySelector('[data-m="save"]').addEventListener('click', () => on.save());
        modal.querySelector('[data-m="restart"]').addEventListener('click', () => on.restart());
      }
    });
  }

  confirm({ title, body, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) {
    return this.mount({
      eyebrow: 'Please confirm',
      title: esc(title),
      body: `<p class="text-dim">${body}</p>`,
      foot: `
        <button class="btn btn--ghost" data-no>Cancel</button>
        <button class="btn ${danger ? 'btn--danger' : 'btn--primary'}" data-yes data-autofocus>${esc(confirmLabel)}</button>
      `,
      onMount: (modal) => {
        modal.querySelector('[data-no]').addEventListener('click', onCancel);
        modal.querySelector('[data-yes]').addEventListener('click', onConfirm);
      }
    });
  }

  toastHost(node) {
    this.toastHostEl = node;
  }
}

function optionHue(o) {
  if (o.type === 'scripture') return 'var(--sword)';
  if (o.type === 'flesh') return 'var(--brimstone)';
  return (ARMOR_BY_ID[o.armorId] || {}).hue || 'var(--gold)';
}

function optionIcon(o) {
  if (o.type === 'scripture') return 'book';
  if (o.type === 'flesh') return 'flame';
  return (ARMOR_BY_ID[o.armorId] || {}).icon || 'shield';
}
