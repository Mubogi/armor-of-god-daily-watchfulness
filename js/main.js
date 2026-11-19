/**
 * Application controller. Owns the game state, drives the day loop,
 * and wires the arena, HUD, screens, and modals together.
 */
import { Arena } from './render/arena.js';
import { Hud, Topbar, Tray } from './ui/hud.js';
import { Screens } from './ui/screens.js';
import { Modals } from './ui/modals.js';
import { icon } from './render/icons.js';
import { esc } from './core/util.js';
import { createState, summarize, resetDay } from './core/state.js';
import * as Day from './game/dayloop.js';
import { resolveChoice, resolveTimeout, ARMOR_BY_ID } from './game/combat.js';
import { ARMOR } from './data/armor.js';
import { PHASES } from './data/modes.js';
import { DEBRIEF_QUESTIONS, rankFor } from './data/discussion.js';
import { THREAT_BY_ID } from './data/threats.js';
import { loadSave, writeSave, clearSave, hasSave, loadMeta, writeMeta } from './core/save.js';

const $ = (sel) => document.querySelector(sel);

const threatFamily = (id) => (THREAT_BY_ID[id] ? THREAT_BY_ID[id].family : 'storm');
const threatName = (id) => (THREAT_BY_ID[id] ? THREAT_BY_ID[id].name : '');
const rankName = (score) => rankFor(score).name;

class Game {
  constructor() {
    this.canvas = $('#arena');
    this.screenLayer = $('#screen-layer');
    this.battleUi = $('#battle-ui');
    this.overlay = $('#overlay');
    this.toasts = $('#toasts');
    this.flashEl = $('#flash');

    this.state = null;
    this.meta = loadMeta();
    this.screen = 'title';
    this.selectedMode = 'growing';
    this.paused = false;
    this.busy = false;
    this.lastNightSummary = null;
    this.currentEncounter = null;

    this.arena = new Arena(this.canvas);
    this.arena.start();
    this.modals = new Modals(this.overlay);

    this.hud = new Hud(this.mkEl('div', 'battle-hud'));
    this.topbar = new Topbar(this.mkEl('div', 'topbar battle-topbar'));
    this.tray = new Tray(this.mkEl('div', 'tray battle-tray'), (id) => this.onTrayAction(id));

    this.buildBattleUi();
    this.bindGlobal();
    this.showTitle();
    this.startClock();
  }

  mkEl(tag, cls) {
    const node = document.createElement(tag);
    node.className = cls;
    return node;
  }

  buildBattleUi() {
    this.battleUi.innerHTML = '';
    const stage = this.mkEl('div', 'battle-stage');
    const hudWrap = this.mkEl('div', 'battle-hud');
    hudWrap.append(this.hud.root);
    const trayWrap = this.mkEl('div', 'battle-tray');
    trayWrap.append(this.tray.root);
    this.battleUi.append(this.topbar.root, stage, hudWrap, trayWrap);

    const intercedeBtn = hudWrap.querySelector('[data-act="intercede"]');
    if (intercedeBtn) intercedeBtn.addEventListener('click', () => this.intercede());
    const codexBtn = hudWrap.querySelector('[data-act="codex"]');
    if (codexBtn) codexBtn.addEventListener('click', () => this.openLibrary());
    const pauseBtn = this.topbar.root.querySelector('[data-act="pause"]');
    if (pauseBtn) pauseBtn.addEventListener('click', () => this.openPause());
  }

  bindGlobal() {
    document.addEventListener('keydown', (e) => this.onKey(e));
    window.addEventListener('beforeunload', () => {
      if (this.state && !this.state.finished) this.persist();
    });
  }

  /** Single rAF loop: arena renders itself; this drives the response timer. */
  startClock() {
    let last = performance.now();
    const step = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      this.tick(dt);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- screens ---------- */

  setScreen(name) {
    this.screen = name;
    const inBattle = name === 'battle';
    this.battleUi.classList.toggle('is-hidden', !inBattle);
    this.battleUi.setAttribute('aria-hidden', String(!inBattle));
    this.screenLayer.classList.toggle('is-hidden', inBattle);
    if (!inBattle) this.arena.setScene({ threats: [], targeted: [] });
  }

  showTitle() {
    this.setScreen('title');
    this.screenLayer.innerHTML = Screens.title({ hasSave: hasSave(), meta: this.meta });
    this.wireScreen({
      continue: () => this.continueRun(),
      new: () => this.showModeSelect(),
      howto: () => this.showHowto(),
      back: () => this.showTitle()
    });
  }

  showModeSelect() {
    this.setScreen('mode');
    this.screenLayer.innerHTML = Screens.modeSelect(this.selectedMode);
    this.screenLayer.querySelectorAll('[data-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectedMode = btn.dataset.mode;
        this.screenLayer.querySelectorAll('[data-mode]').forEach((b) => {
          b.classList.toggle('is-selected', b.dataset.mode === this.selectedMode);
          b.setAttribute('aria-checked', String(b.dataset.mode === this.selectedMode));
        });
      });
    });
    this.wireScreen({
      back: () => this.showTitle(),
      start: () => this.startRun(this.selectedMode)
    });
  }

  showHowto() {
    this.setScreen('howto');
    this.screenLayer.innerHTML = Screens.howto();
    this.wireScreen({ back: () => this.showTitle() });
  }

  wireScreen(actions) {
    this.screenLayer.querySelectorAll('[data-act]').forEach((btn) => {
      const act = btn.dataset.act;
      if (actions[act]) btn.addEventListener('click', actions[act]);
      else if (act === 'pause') btn.addEventListener('click', () => this.openPause());
    });
  }

  /* ---------- run lifecycle ---------- */

  startRun(modeId) {
    this.state = createState(modeId);
    this.state.dayThreatIds = [];
    this.state.morningVerse = null;
    resetDay(this.state);
    this.hud.resetTrends();
    this.persist();
    this.showBriefing();
  }

  continueRun() {
    const save = loadSave();
    if (!save) return this.showTitle();
    this.state = save;
    if (!Array.isArray(this.state.dayThreatIds)) this.state.dayThreatIds = [];
    if (!this.state.decayMod) this.state.decayMod = {};
    this.hud.resetTrends();
    this.resumeFromState();
  }

  resumeFromState() {
    const st = this.state;
    if (st.finished || st.phase === 'debrief') return this.showDebrief();
    if (st.phase === 'morning') return this.showBriefing();
    if (st.phase === 'night') {
      const last = st.dayResults[st.dayResults.length - 1];
      return this.showNight(this.lastNightSummary || {
        dayStats: last || { blocked: 0, breached: 0, threats: 0 },
        decay: {},
        reward: null
      });
    }
    if (!st.dayThreatIds.length) Day.beginBattle(st);
    if (st.waveIndex >= st.dayThreatIds.length) return this.openEvening();
    this.setScreen('battle');
    this.renderBattle();
    this.nextThreat();
  }

  persist() {
    if (this.state) writeSave(this.state);
  }

  /* ---------- morning ---------- */

  showBriefing() {
    this.setScreen('brief');
    this.screenLayer.innerHTML = Screens.briefing(this.state);
    this.wireScreen({ plan: () => this.showPlanner(), pause: () => this.openPause() });
    this.arena.setScene({ armor: this.state.armor, threats: [], targeted: [] });
  }

  showPlanner() {
    this.setScreen('planner');
    this.renderPlanner();
  }

  renderPlanner() {
    this.screenLayer.innerHTML = Screens.planner(this.state);
    this.screenLayer.querySelectorAll('[data-dev-inc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (Day.addDevotion(this.state, btn.dataset.devInc)) this.renderPlanner();
      });
    });
    this.screenLayer.querySelectorAll('[data-dev-dec]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (Day.removeDevotion(this.state, btn.dataset.devDec)) this.renderPlanner();
      });
    });
    this.wireScreen({ commit: () => this.commitMorning(), pause: () => this.openPause() });
  }

  commitMorning() {
    const result = Day.commitMorning(this.state);
    if (result.verse) this.toast(`Verse found: ${result.verse.ref}`, 'book', 'var(--sword)');
    const gainText = Object.entries(result.gains)
      .map(([k, v]) => `${ARMOR_BY_ID[k].short} +${Math.round(v)}`)
      .join('   ');
    if (gainText) this.toast(gainText, 'spark', 'var(--gold)');
    this.persist();
    this.startBattle();
  }

  /* ---------- battle ---------- */

  startBattle() {
    Day.beginBattle(this.state);
    this.setScreen('battle');
    this.renderBattle();
    this.syncScene();
    this.nextThreat();
  }

  /** Mirror state into the arena scene. */
  syncScene() {
    const total = this.state.dayThreatIds.length;
    const idx = this.state.waveIndex;
    const threats = this.state.dayThreatIds.map((id, i) => ({
      id,
      family: threatFamily(id),
      angle: -Math.PI / 2 + (i / Math.max(1, total)) * Math.PI * 2 + 0.35,
      progress: i < idx ? 0 : i === idx ? 0.55 : 0.18,
      size: 17,
      seed: i * 1.7,
      label: i === idx ? threatName(id) : '',
      dead: i < idx
    }));
    this.arena.setScene({
      armor: this.state.armor,
      threats,
      targeted: this.currentEncounter ? this.currentEncounter.threat.targets : []
    });
  }

  renderBattle() {
    const phase = PHASES[1];
    this.topbar.update(this.state, phase.clock, phase.label);
    this.hud.update(this.state, {});
    this.tray.clearArm();
    this.tray.setEnabled(true);
  }

  nextThreat() {
    const enc = Day.nextEncounter(this.state);
    if (!enc) return this.openEvening();
    this.currentEncounter = enc;
    this.windowLeft = enc.window;
    this.windowTotal = enc.window;
    this.busy = false;

    this.syncScene();
    // A hidden trap conceals which piece is under attack: the player must read the threat.
    const reveal = !enc.trapHidden;
    this.hud.update(this.state, { targeted: reveal ? enc.threat.targets : [] });

    this.modals.encounter({
      encounter: enc,
      state: this.state,
      onChoose: (opt) => this.choose(opt),
      onIntercede: () => this.intercedeDuringBattle()
    });
    this.paintTimer();
  }

  onTrayAction(armorId) {
    if (this.screen !== 'battle' || !this.currentEncounter || this.busy) return;
    const opt = this.currentEncounter.options.find((o) => o.type === 'armor' && o.armorId === armorId);
    if (opt) {
      this.tray.arm(armorId);
      this.choose(opt);
    }
  }

  choose(opt) {
    if (this.busy) return;
    this.busy = true;
    const enc = this.currentEncounter;
    const timing = Math.max(0, Math.min(1, (this.windowLeft || 0) / (this.windowTotal || 1)));
    const result = resolveChoice(enc, opt, this.state, timing);
    this.applyOutcome(enc, result);
  }

  applyOutcome(enc, result) {
    const before = { ...this.state.armor };
    const applied = Day.applyResult(this.state, enc, result);
    this.playFeedback(result, applied);
    this.warnBreaches(before);
    this.persist();
    this.topbar.update(this.state, PHASES[1].clock, PHASES[1].label);
    this.hud.update(this.state, { targeted: [] });

    const isLast = this.state.waveIndex >= this.state.dayThreatIds.length;
    this.modals.result({
      result,
      encounter: enc,
      isLast,
      onContinue: () => {
        this.modals.close();
        if (isLast) this.openEvening();
        else this.nextThreat();
      }
    });
  }

  playFeedback(result, applied) {
    const good = result.tone === 'good';
    const mixed = result.tone === 'mixed';
    const cx = this.arena.center.x;
    const cy = this.arena.center.y;

    for (const id of Object.keys(applied)) this.arena.pulseArmor(id);

    if (result.strike) {
      this.arena.ring('#ffe6a8', { r0: 20, r1: 200, dur: 0.75 });
      this.arena.burst('strike', { count: 30, hue: '#ffe6a8', speed: 4 });
      this.arena.floatText('The Word cuts through', { hue: '#ffe6a8', size: 17 });
      this.flash('grace');
    } else if (good) {
      this.arena.ring('#59d6a6', { r0: 24, r1: 165, dur: 0.7 });
      this.arena.burst('block', { count: 20, hue: '#59d6a6', speed: 3 });
      this.arena.floatText('Held', { hue: '#59d6a6', size: 16 });
      this.flash('grace');
    } else if (mixed) {
      this.arena.ring('#ff9a4d', { r0: 24, r1: 130, dur: 0.6 });
      this.arena.floatText('Partial', { hue: '#ff9a4d', size: 15 });
    } else {
      this.arena.damage(1);
      this.arena.burst('hit', { count: 26, hue: '#ff5c5c', speed: 3.4 });
      this.arena.floatText(result.flesh ? 'Flesh' : 'Breach', { hue: '#ff5c5c', size: 16 });
      this.flash('bad');
    }

    for (const [id, v] of Object.entries(applied)) {
      if (Math.abs(v) < 0.5) continue;
      const meta = ARMOR_BY_ID[id];
      const idx = ARMOR.findIndex((a) => a.id === id);
      const ang = -Math.PI / 2 + (idx / ARMOR.length) * Math.PI * 2;
      const r = this.arena.radius + 42;
      this.arena.floatText(`${v > 0 ? '+' : ''}${Math.round(v)}`, {
        x: cx + Math.cos(ang) * r,
        y: cy + Math.sin(ang) * r,
        hue: v > 0 ? meta.hex : '#ff7a8a',
        size: 14,
        rise: 30
      });
    }

    if (this.state.streak > 1 && result.streakUp) {
      this.toast(`${this.state.streak} in a row — standing firm`, 'flame', 'var(--jade)');
    }
  }

  /** Surface newly-critical armor pieces once, so neglect is never silent. */
  warnBreaches(before) {
    for (const meta of ARMOR) {
      const was = before[meta.id];
      const now = this.state.armor[meta.id];
      if (was >= 25 && now < 25) {
        this.toast(`${meta.name} is failing — ${meta.breach}`, 'info', 'var(--brimstone)');
      }
    }
  }

  flash(kind) {
    this.flashEl.className = `flash ${kind === 'grace' ? 'flash--grace' : ''}`;
    void this.flashEl.offsetWidth;
    this.flashEl.classList.add('is-active');
  }

  /* ---------- evening ---------- */

  openEvening() {
    this.modals.evening({
      state: this.state,
      onChoose: (actId) => {
        const applied = Day.eveningAct(this.state, actId);
        this.modals.close();
        if (applied) for (const id of Object.keys(applied)) this.arena.pulseArmor(id);
        const summary = Day.closeDay(this.state);
        this.lastNightSummary = summary;
        this.persist();
        this.showNight(summary);
      }
    });
  }

  showNight(summary) {
    this.lastNightSummary = summary;
    for (const meta of ARMOR) {
      if (this.state.armor[meta.id] < 20) {
        this.toast(`${meta.name} is nearly gone. Rebuild it tomorrow morning.`, 'info', 'var(--brimstone)');
      }
    }
    this.setScreen('night');
    this.screenLayer.innerHTML = Screens.night(this.state, summary);
    this.arena.setScene({ armor: this.state.armor, threats: [], targeted: [] });
    this.wireScreen({
      'next-day': () => {
        const wasLast = this.state.day >= this.state.weekLength;
        Day.advanceDay(this.state);
        this.hud.resetTrends();
        this.persist();
        if (wasLast || this.state.finished) this.showDebrief();
        else this.showBriefing();
      }
    });
  }

  /* ---------- debrief ---------- */

  showDebrief() {
    const summary = summarize(this.state);
    const questions = this.pickQuestions(summary);

    this.meta.runsCompleted += 1;
    if (summary.score > this.meta.bestScore) {
      this.meta.bestScore = summary.score;
      this.meta.bestRank = rankName(summary.score);
    }
    this.meta.totalBlocks += summary.blocked;
    this.meta.unlockedVerses = [...new Set([...this.meta.unlockedVerses, ...this.state.verses])];
    writeMeta(this.meta);

    this.state.finished = true;
    clearSave();

    this.setScreen('debrief');
    this.screenLayer.innerHTML = Screens.debrief(this.state, summary, questions);
    this.arena.setScene({ armor: this.state.armor, threats: [], targeted: [] });
    this.wireScreen({
      new: () => this.showModeSelect(),
      codex: () => this.openLibrary(),
      title: () => this.showTitle()
    });
  }

  pickQuestions(summary) {
    const picked = [];
    const armorQ = DEBRIEF_QUESTIONS.armor[summary.weakest];
    if (armorQ) picked.push(armorQ);

    const p = DEBRIEF_QUESTIONS.pattern;
    const candidates = [];
    if (summary.blockRate >= 80) candidates.push(p.manyBlocks);
    if (summary.breached >= 3) candidates.push(p.manyBreaches);
    if (summary.flesh >= 2) candidates.push(p.fleshReactions);
    if (summary.scriptureStrikes >= 2) candidates.push(p.scriptureUsed);
    if (summary.intercessions > 0) candidates.push(p.intercession);
    if (summary.perfectDays > 0) candidates.push(p.perfectDay);
    if (candidates.length) picked.push(candidates[Math.floor(Math.random() * candidates.length)]);

    picked.push(DEBRIEF_QUESTIONS.closers[Math.floor(Math.random() * DEBRIEF_QUESTIONS.closers.length)]);
    return picked.slice(0, 3);
  }

  /* ---------- modals ---------- */

  /** Intercession from inside an encounter: applies grace, then reopens the same threat. */
  intercedeDuringBattle() {
    if (!this.state || this.state.intercessionCharges <= 0) {
      this.toast('No intercession charges — plan Service & Intercession in the morning', 'info', 'var(--ember)');
      return;
    }
    const enc = this.currentEncounter;
    const frozen = this.windowLeft;
    this.modals.intercession({
      state: this.state,
      onConfirm: () => {
        const applied = Day.useIntercession(this.state);
        this.modals.close();
        if (applied) {
          for (const id of Object.keys(applied)) this.arena.pulseArmor(id);
          this.arena.ring('#ffc978', { r0: 30, r1: 220, dur: 0.9 });
          this.arena.burst('pray', { count: 26, hue: '#ffc978', speed: 2.6 });
          this.arena.floatText('Standing with them', { hue: '#ffc978', size: 15 });
        }
        this.toast('You stood with a brother or sister in prayer', 'hands', 'var(--prayer)');
        this.hud.update(this.state, { targeted: enc.threat.targets });
        this.persist();
        // Restore the encounter with the same timer position
        this.windowLeft = frozen;
        this.modals.encounter({
          encounter: enc,
          state: this.state,
          onChoose: (opt) => this.choose(opt),
          onIntercede: () => this.intercedeDuringBattle()
        });
      },
      onCancel: () => {
        this.windowLeft = frozen;
        this.modals.encounter({
          encounter: enc,
          state: this.state,
          onChoose: (opt) => this.choose(opt),
          onIntercede: () => this.intercedeDuringBattle()
        });
      }
    });
  }

  openPause() {
    if (this.paused) return;
    this.paused = true;
    this.modals.pause({
      state: this.state || createState(this.selectedMode),
      meta: this.meta,
      on: {
        library: () => {
          this.modals.close();
          this.paused = false;
          this.openLibrary();
        },
        save: () => {
          this.persist();
          this.toast('Progress saved', 'save', 'var(--jade)');
          this.modals.close();
          this.paused = false;
        },
        restart: () => {
          this.modals.confirm({
            title: 'Restart the week?',
            body: 'This run will be discarded. Your Scripture unlocks and best score are kept.',
            confirmLabel: 'Restart',
            danger: true,
            onConfirm: () => {
              clearSave();
              this.modals.close();
              this.paused = false;
              this.showModeSelect();
            },
            onCancel: () => {
              this.paused = false;
              this.openPause();
            }
          });
        }
      }
    });
    const prevClose = this.modals.onClose;
    this.modals.onClose = () => {
      this.paused = false;
      if (prevClose) prevClose();
    };
  }

  openLibrary() {
    this.modals.library({
      state: this.state || createState(this.selectedMode),
      onClose: () => this.modals.close()
    });
  }

  intercede() {
    if (!this.state) return;
    if (this.state.intercessionCharges <= 0) {
      this.toast('No intercession charges — plan Service & Intercession in the morning', 'info', 'var(--ember)');
      return;
    }
    this.modals.intercession({
      state: this.state,
      onConfirm: () => {
        const applied = Day.useIntercession(this.state);
        this.modals.close();
        if (applied) {
          for (const id of Object.keys(applied)) this.arena.pulseArmor(id);
          this.arena.ring('#ffc978', { r0: 30, r1: 220, dur: 0.9 });
          this.arena.burst('pray', { count: 26, hue: '#ffc978', speed: 2.6 });
          this.arena.floatText('Standing with them', { hue: '#ffc978', size: 15 });
        }
        this.toast('You stood with a brother or sister in prayer', 'hands', 'var(--prayer)');
        this.hud.update(this.state, {});
        this.persist();
      },
      onCancel: () => this.modals.close()
    });
  }

  /* ---------- toast ---------- */

  toast(text, iconName = 'spark', hue = 'var(--gold)') {
    const node = document.createElement('div');
    node.className = 'toast';
    node.style.setProperty('--accent', hue);
    node.innerHTML = `<span class="toast__icon">${icon(iconName, 15)}</span><span class="toast__text">${esc(text)}</span>`;
    this.toasts.append(node);
    setTimeout(() => {
      node.classList.add('is-out');
      setTimeout(() => node.remove(), 300);
    }, 3200);
    while (this.toasts.children.length > 4) this.toasts.firstElementChild.remove();
  }

  /* ---------- keyboard ---------- */

  onKey(e) {
    if (e.key === 'Escape') {
      if (this.modals.isOpen) {
        if (this.modals.closable) this.modals.close();
        return;
      }
      if (['battle', 'planner', 'brief'].includes(this.screen)) this.openPause();
      return;
    }

    if ((e.key === 'l' || e.key === 'L') && this.screen === 'battle' && !this.modals.isOpen) {
      this.openLibrary();
      return;
    }

    if (this.modals.isOpen) {
      const map = { a: 0, b: 1, c: 2, d: 3, 1: 0, 2: 1, 3: 2, 4: 3 };
      const key = e.key.toLowerCase();
      if (key in map && this.currentEncounter && !this.busy && this.modals.modal) {
        const btn = this.modals.modal.querySelector(`[data-opt="${map[key]}"]`);
        if (btn) {
          e.preventDefault();
          btn.click();
        }
      }
      return;
    }

    if (this.screen === 'battle' && /^[1-7]$/.test(e.key)) {
      const meta = ARMOR[Number(e.key) - 1];
      if (meta) this.onTrayAction(meta.id);
    }
  }

  /* ---------- per-frame ---------- */

  tick(dt) {
    if (this.screen !== 'battle' || !this.currentEncounter || this.busy) return;
    if (this.windowLeft <= 0) return;
    this.windowLeft = Math.max(0, this.windowLeft - dt);
    this.paintTimer();

    if (this.windowLeft <= 0) {
      this.busy = true;
      const enc = this.currentEncounter;
      const result = resolveTimeout(enc, this.state);
      this.applyOutcome(enc, result);
    }
  }

  paintTimer() {
    const modal = this.modals.modal;
    if (!modal) return;
    const fill = modal.querySelector('[data-timer-fill]');
    const label = modal.querySelector('[data-timer-label]');
    if (!fill) return;
    const frac = Math.max(0, Math.min(1, this.windowLeft / (this.windowTotal || 1)));
    fill.style.transform = `scaleX(${frac})`;
    fill.classList.toggle('is-urgent', frac < 0.34);
    if (label) label.textContent = `${this.windowLeft.toFixed(1)}s`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.__game = new Game();
});
