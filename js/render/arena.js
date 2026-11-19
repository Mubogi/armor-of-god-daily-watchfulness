/**
 * Canvas arena. Owns the render loop, particles, floating text, and the
 * armour aura around the believer. Fed by `setScene()`; never reads game state.
 */
import { drawBeliever, drawArmorSegment, threatShapes, hexA } from './sprites.js';
import { ARMOR } from '../data/armor.js';
import { FAMILY_META } from '../data/threats.js';
import { clamp, rand } from '../core/util.js';

const SEGMENT_GAP = 0.055;

export class Arena {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = 0;
    this.h = 0;
    this.t = 0;
    this.last = 0;
    this.raf = 0;
    this.particles = [];
    this.floaters = [];
    this.rings = [];
    this.threats = [];
    this.armor = {};
    this.hurt = 0;
    this.flashArmor = {};
    this.shake = 0;
    this.targeted = [];
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this._resize = this._resize.bind(this);
    this._frame = this._frame.bind(this);
    this.resizeObserver = new ResizeObserver(this._resize);
    this.resizeObserver.observe(canvas);
    window.addEventListener('resize', this._resize);
    this._resize();
  }

  _resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.w = Math.max(1, rect.width);
    this.h = Math.max(1, rect.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.center = { x: this.w / 2, y: this.h * 0.56 };
    this.radius = Math.min(this.w, this.h) * 0.235;
  }

  start() {
    if (this.raf) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this._frame);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  setScene(scene) {
    if (scene.armor) this.armor = scene.armor;
    if (scene.threats) this.threats = scene.threats;
    if (scene.targeted) this.targeted = scene.targeted;
  }

  /* ---------- Effects API ---------- */

  burst(kind, opts = {}) {
    const { x, y, count = 18, hue = '#e8c46a', spread = Math.PI * 2, speed = 2.4, angle = 0 } = opts;
    for (let i = 0; i < count; i += 1) {
      const a = angle + rand(-spread / 2, spread / 2);
      const v = rand(speed * 0.4, speed);
      this.particles.push({
        x: x ?? this.center.x,
        y: y ?? this.center.y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: rand(0.5, 1.1),
        maxLife: 1.1,
        size: rand(1.2, 3.4),
        hue,
        kind
      });
    }
  }

  floatText(text, opts = {}) {
    const { x, y, hue = '#f2ead7', size = 15, rise = 46 } = opts;
    this.floaters.push({
      text,
      x: x ?? this.center.x,
      y: y ?? this.center.y - 20,
      hue,
      size,
      life: 1,
      rise
    });
  }

  ring(hue = '#e8c46a', opts = {}) {
    const { x, y, r0 = 10, r1 = 120, dur = 0.8 } = opts;
    this.rings.push({
      x: x ?? this.center.x,
      y: y ?? this.center.y,
      r0,
      r1,
      life: 1,
      dur,
      hue
    });
  }

  damage(intensity = 1) {
    this.hurt = Math.min(1, this.hurt + intensity * 0.6);
    this.shake = Math.min(14, this.shake + intensity * 7);
  }

  pulseArmor(id) {
    this.flashArmor[id] = 1;
  }

  /* ---------- Render loop ---------- */

  _frame(now) {
    const dt = Math.min(0.05, (now - this.last) / 1000 || 0.016);
    this.last = now;
    this.t += dt;
    this._update(dt);
    this._draw();
    this.raf = requestAnimationFrame(this._frame);
  }

  _update(dt) {
    this.hurt = Math.max(0, this.hurt - dt * 1.6);
    this.shake = Math.max(0, this.shake - dt * 26);
    for (const k of Object.keys(this.flashArmor)) {
      this.flashArmor[k] = Math.max(0, this.flashArmor[k] - dt * 2.2);
    }

    this.particles = this.particles.filter((p) => {
      p.life -= dt;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + dt * 22;
      return p.life > 0;
    });

    this.floaters = this.floaters.filter((f) => {
      f.life -= dt * 0.62;
      f.y -= f.rise * dt;
      return f.life > 0;
    });

    this.rings = this.rings.filter((r) => {
      r.life -= dt / r.dur;
      return r.life > 0;
    });
  }

  _draw() {
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    if (this.shake > 0.2 && !this.reduced) {
      ctx.translate(rand(-this.shake, this.shake) * 0.5, rand(-this.shake, this.shake) * 0.5);
    }

    this._drawGround();
    this._drawAuraRings();
    this._drawThreats();

    const cx = this.center.x;
    const cy = this.center.y;
    drawBeliever(ctx, cx, cy, this.t, { hurt: this.hurt });

    this._drawArmorArcs();
    this._drawParticles();
    this._drawRings();
    this._drawFloaters();

    ctx.restore();
  }

  _drawGround() {
    const { ctx, center, radius, w, h } = this;
    const cy = center.y + radius * 1.45;

    // Floor glow
    const g = ctx.createRadialGradient(center.x, cy, 4, center.x, cy, radius * 2.6);
    g.addColorStop(0, 'rgba(111, 168, 255, 0.16)');
    g.addColorStop(0.5, 'rgba(111, 168, 255, 0.05)');
    g.addColorStop(1, 'rgba(111, 168, 255, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(center.x, cy, radius * 2.6, radius * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Concentric rings on the floor
    ctx.strokeStyle = 'rgba(160, 186, 240, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i += 1) {
      ctx.beginPath();
      ctx.ellipse(center.x, cy, radius * (0.9 + i * 0.55), radius * (0.22 + i * 0.13), 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Vignette
    const v = ctx.createRadialGradient(w / 2, h * 0.5, Math.min(w, h) * 0.25, w / 2, h * 0.5, Math.max(w, h) * 0.72);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(3,5,10,0.55)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  }

  _drawAuraRings() {
    const { ctx, center, radius } = this;
    const t = this.t;
    // Slow rotating halo
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(t * 0.06);
    ctx.strokeStyle = 'rgba(232, 196, 106, 0.10)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 2; i += 1) {
      ctx.beginPath();
      const r = radius * (1.45 + i * 0.16);
      for (let k = 0; k <= 48; k += 1) {
        const a = (k / 48) * Math.PI * 2;
        const wobble = Math.sin(a * 6 + t * 0.8 + i) * 2;
        const x = Math.cos(a) * (r + wobble);
        const y = Math.sin(a) * (r + wobble);
        if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawThreats() {
    const { ctx, center, radius } = this;
    const t = this.t;

    for (const th of this.threats) {
      if (th.dead) continue;
      const p = clamp(th.progress ?? 0, 0, 1);
      // Approach from outer edge toward the aura
      const dist = radius * 3.1 * (1 - p) + radius * 1.06;
      const ang = th.angle;
      const x = center.x + Math.cos(ang) * dist;
      const y = center.y + Math.sin(ang) * dist * 0.72;

      ctx.save();
      ctx.translate(x, y);
      const meta = FAMILY_META[th.family] || FAMILY_META.storm;
      const shape = threatShapes[meta.shape] || threatShapes.cloud;
      const size = (th.size || 20) * (0.75 + p * 0.4);
      shape(ctx, p, size, t + (th.seed || 0));

      if (th.label) {
        ctx.globalAlpha = 0.55 + p * 0.4;
        ctx.fillStyle = meta.hex;
        ctx.font = '600 10px ui-sans-serif, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(th.label.toUpperCase(), 0, -size * 1.9);
      }
      ctx.restore();
    }
  }

  _drawArmorArcs() {
    const { ctx, center, radius } = this;
    const n = ARMOR.length;
    const span = (Math.PI * 2) / n;

    for (let i = 0; i < n; i += 1) {
      const meta = ARMOR[i];
      const level = this.armor[meta.id] ?? 0;
      const start = -Math.PI / 2 + i * span + SEGMENT_GAP;
      const end = -Math.PI / 2 + (i + 1) * span - SEGMENT_GAP;
      const flash = this.flashArmor[meta.id] || 0;
      const active = level > 0.5 || flash > 0.05;
      const hue = meta.hex;

      // Only draw the filled portion proportional to level
      const frac = clamp(level, 0, 100) / 100;
      const a0 = start;
      const a1 = start + (end - start) * frac;
      if (a1 > a0 + 0.001) {
        drawArmorSegment(ctx, center.x, center.y, radius, a0, a1, level, hue, this.t, active);
      }
      // Empty remainder hint
      if (frac < 0.999) {
        ctx.save();
        ctx.strokeStyle = 'rgba(160, 186, 240, 0.09)';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, Math.max(a1 + 0.01, a0), end);
        ctx.stroke();
        ctx.restore();
      }
      // Flash overlay when struck/raised
      if (flash > 0.01) {
        ctx.save();
        ctx.globalAlpha = flash * 0.75;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 9;
        ctx.lineCap = 'round';
        ctx.shadowColor = hue;
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, start, end);
        ctx.stroke();
        ctx.restore();
      }
      // Target warning ticks
      if (this.targeted.includes(meta.id)) {
        ctx.save();
        const pulse = (Math.sin(this.t * 6) + 1) / 2;
        ctx.globalAlpha = 0.4 + pulse * 0.45;
        ctx.strokeStyle = '#ff5c5c';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius + 13, start, end);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  _drawParticles() {
    const { ctx } = this;
    for (const p of this.particles) {
      const a = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.hue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  _drawRings() {
    const { ctx } = this;
    for (const r of this.rings) {
      const prog = 1 - r.life;
      ctx.globalAlpha = r.life * 0.8;
      ctx.strokeStyle = r.hue;
      ctx.lineWidth = 2.5 * r.life + 0.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r0 + (r.r1 - r.r0) * prog, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  _drawFloaters() {
    const { ctx } = this;
    for (const f of this.floaters) {
      const a = Math.min(1, f.life * 1.6);
      ctx.globalAlpha = a;
      ctx.fillStyle = f.hue;
      ctx.font = `700 ${f.size}px ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 6;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  destroy() {
    this.stop();
    this.resizeObserver.disconnect();
    window.removeEventListener('resize', this._resize);
  }
}

export { hexA };
