/** Procedural sprite drawing. Pure canvas — no image assets, no loading. */

export function drawBeliever(ctx, x, y, t, opts = {}) {
  const { hurt = 0, glow = 1, breathe = 1 } = opts;
  const bob = Math.sin(t * 1.7) * 2.2 * breathe;
  const sway = Math.sin(t * 0.9) * 1.4;

  ctx.save();
  ctx.translate(x, y + bob);

  // Ground shadow
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(0, 40, 26, 7, 0, 0, Math.PI * 2);
  ctx.filter = 'blur(4px)';
  ctx.fill();
  ctx.restore();

  // Robe
  const robeGrad = ctx.createLinearGradient(0, -6, 0, 44);
  robeGrad.addColorStop(0, '#2b3a63');
  robeGrad.addColorStop(0.55, '#1b2747');
  robeGrad.addColorStop(1, '#111a30');
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(-11, -2);
  ctx.quadraticCurveTo(-17, 22, -20, 40);
  ctx.quadraticCurveTo(0, 46, 20, 40);
  ctx.quadraticCurveTo(17, 22, 11, -2);
  ctx.closePath();
  ctx.fill();

  // Robe highlight (light source upper-left)
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = '#9fc0ff';
  ctx.beginPath();
  ctx.moveTo(-9, 0);
  ctx.quadraticCurveTo(-14, 22, -16, 38);
  ctx.quadraticCurveTo(-8, 41, -3, 40);
  ctx.quadraticCurveTo(-5, 20, -4, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Sash / belt of truth hint
  ctx.strokeStyle = 'rgba(240, 211, 138, 0.75)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-12, 16);
  ctx.quadraticCurveTo(0, 19, 12, 16);
  ctx.stroke();

  // Shoulders
  ctx.fillStyle = '#22304f';
  ctx.beginPath();
  ctx.ellipse(-11, 2, 7, 5, -0.3, 0, Math.PI * 2);
  ctx.ellipse(11, 2, 7, 5, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Head
  const headGrad = ctx.createRadialGradient(-2, -18, 1, 0, -14, 13);
  headGrad.addColorStop(0, '#e8c9a8');
  headGrad.addColorStop(1, '#b8946e');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(sway * 0.3, -14, 9.2, 10.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair / hood shadow
  ctx.fillStyle = 'rgba(40, 32, 26, 0.85)';
  ctx.beginPath();
  ctx.ellipse(sway * 0.3, -20, 9.4, 6.4, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Face marks (subtle, non-representational)
  ctx.fillStyle = 'rgba(60, 44, 32, 0.5)';
  ctx.beginPath();
  ctx.ellipse(-3.4, -13.4, 1.15, 0.85, 0, 0, Math.PI * 2);
  ctx.ellipse(3.4, -13.4, 1.15, 0.85, 0, 0, Math.PI * 2);
  ctx.fill();

  // Arms raised in prayer posture
  ctx.strokeStyle = '#c9a582';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  const armLift = Math.sin(t * 1.3) * 2;
  ctx.beginPath();
  ctx.moveTo(-10, 4);
  ctx.quadraticCurveTo(-20, 4 - armLift, -23, -12 - armLift);
  ctx.moveTo(10, 4);
  ctx.quadraticCurveTo(20, 4 + armLift, 23, -12 + armLift);
  ctx.stroke();

  // Hands
  ctx.fillStyle = '#dcc0a0';
  ctx.beginPath();
  ctx.arc(-23, -13 - armLift, 3.1, 0, Math.PI * 2);
  ctx.arc(23, -13 + armLift, 3.1, 0, Math.PI * 2);
  ctx.fill();

  // Hurt tint
  if (hurt > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = Math.min(0.6, hurt);
    ctx.fillStyle = '#ff3b3b';
    ctx.fillRect(-30, -34, 60, 82);
    ctx.restore();
  }

  ctx.restore();
}

/** Draw one armor piece as a shield-segment arc around the believer. */
export function drawArmorSegment(ctx, cx, cy, radius, startAngle, endAngle, level, hue, t, active) {
  const alpha = 0.18 + (level / 100) * 0.62;
  const width = 7 + (level / 100) * 7;

  ctx.save();
  ctx.lineCap = 'round';

  // Base track
  ctx.strokeStyle = 'rgba(160, 186, 240, 0.10)';
  ctx.lineWidth = width + 5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.stroke();

  // Filled arc
  const grad = ctx.createLinearGradient(
    cx + Math.cos(startAngle) * radius,
    cy + Math.sin(startAngle) * radius,
    cx + Math.cos(endAngle) * radius,
    cy + Math.sin(endAngle) * radius
  );
  grad.addColorStop(0, hexA(hue, alpha * 0.5));
  grad.addColorStop(0.5, hexA(hue, alpha));
  grad.addColorStop(1, hexA(hue, alpha * 0.5));

  ctx.strokeStyle = grad;
  ctx.lineWidth = width;
  ctx.shadowColor = hexA(hue, level > 25 ? 0.5 : 0.15);
  ctx.shadowBlur = active ? 26 : 12;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Bright leading edge
  ctx.strokeStyle = hexA(hue, Math.min(1, alpha + 0.3));
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + width / 2 - 1, startAngle, endAngle);
  ctx.stroke();

  // Pulse when nearly full
  if (level > 85 && active) {
    const pulse = (Math.sin(t * 3) + 1) / 2;
    ctx.globalAlpha = 0.25 + pulse * 0.25;
    ctx.strokeStyle = hue;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + width / 2 + 3 + pulse * 3, startAngle, endAngle);
    ctx.stroke();
  }

  ctx.restore();
}

/** Hex or CSS colour + alpha → rgba(). Accepts #rrggbb. */
export function hexA(hex, alpha) {
  if (hex.startsWith('rgb')) return hex;
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Threat visuals by family. Each returns a draw function bound to progress. */
export const threatShapes = {
  cloud(ctx, p, size, t) {
    ctx.save();
    const wob = Math.sin(t * 2 + p * 4) * 3;
    ctx.globalAlpha = 0.22 + p * 0.5;
    const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, size);
    grad.addColorStop(0, 'rgba(120, 138, 190, 0.85)');
    grad.addColorStop(1, 'rgba(60, 74, 110, 0)');
    ctx.fillStyle = grad;
    for (let i = 0; i < 4; i += 1) {
      const a = (i / 4) * Math.PI * 2 + t * 0.4;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * size * 0.34 + wob, Math.sin(a) * size * 0.22, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  dart(ctx, p, size, t) {
    ctx.save();
    ctx.rotate(Math.sin(t * 6) * 0.06);
    // Flame tail
    const tail = size * (1.6 + Math.sin(t * 9) * 0.2);
    const grad = ctx.createLinearGradient(-tail, 0, 0, 0);
    grad.addColorStop(0, 'rgba(255, 90, 30, 0)');
    grad.addColorStop(1, 'rgba(255, 160, 60, 0.85)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-tail, 0);
    ctx.quadraticCurveTo(-tail * 0.5, -size * 0.34, 0, 0);
    ctx.quadraticCurveTo(-tail * 0.5, size * 0.34, -tail, 0);
    ctx.fill();
    // Head
    ctx.fillStyle = '#ffd08a';
    ctx.shadowColor = 'rgba(255, 140, 50, 0.9)';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(size * 0.7, 0);
    ctx.lineTo(-size * 0.2, -size * 0.32);
    ctx.lineTo(-size * 0.05, 0);
    ctx.lineTo(-size * 0.2, size * 0.32);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  },

  orb(ctx, p, size, t) {
    ctx.save();
    const breathe = 1 + Math.sin(t * 3) * 0.06;
    const grad = ctx.createRadialGradient(-size * 0.2, -size * 0.2, size * 0.1, 0, 0, size * breathe);
    grad.addColorStop(0, 'rgba(255, 240, 190, 0.95)');
    grad.addColorStop(0.5, 'rgba(255, 209, 102, 0.75)');
    grad.addColorStop(1, 'rgba(190, 130, 40, 0.15)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, size * breathe, 0, Math.PI * 2);
    ctx.fill();
    // Ribbon
    ctx.strokeStyle = 'rgba(255, 235, 180, 0.7)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 1.05, size * 0.42, t * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },

  arrow(ctx, p, size, t) {
    ctx.save();
    ctx.rotate(0.35 + Math.sin(t * 2.5) * 0.04);
    ctx.strokeStyle = 'rgba(255, 122, 138, 0.9)';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-size * 1.4, 0);
    ctx.lineTo(size * 0.5, 0);
    ctx.stroke();
    // Fletching
    ctx.strokeStyle = 'rgba(255, 122, 138, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-size * 1.4, 0); ctx.lineTo(-size * 1.05, -size * 0.3);
    ctx.moveTo(-size * 1.4, 0); ctx.lineTo(-size * 1.05, size * 0.3);
    ctx.stroke();
    // Head
    ctx.fillStyle = '#ff9aa6';
    ctx.shadowColor = 'rgba(255, 90, 110, 0.8)';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(size * 0.85, 0);
    ctx.lineTo(size * 0.35, -size * 0.26);
    ctx.lineTo(size * 0.35, size * 0.26);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  },

  fog(ctx, p, size, t) {
    ctx.save();
    ctx.globalAlpha = 0.16 + p * 0.32;
    for (let i = 0; i < 5; i += 1) {
      const a = t * 0.5 + i * 1.3;
      const px = Math.cos(a) * size * 0.5;
      const py = Math.sin(a * 1.3) * size * 0.34;
      const r = size * (0.45 + Math.sin(a * 2) * 0.12);
      const grad = ctx.createRadialGradient(px, py, 0, px, py, r);
      grad.addColorStop(0, 'rgba(170, 184, 214, 0.55)');
      grad.addColorStop(1, 'rgba(120, 134, 168, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  sigil(ctx, p, size, t) {
    ctx.save();
    ctx.rotate(t * 0.7);
    ctx.strokeStyle = 'rgba(165, 140, 255, 0.85)';
    ctx.lineWidth = 1.8;
    ctx.shadowColor = 'rgba(165, 140, 255, 0.7)';
    ctx.shadowBlur = 16;
    const r = size * 0.9;
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * Math.PI * 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    for (let i = 0; i < 3; i += 1) {
      const a = (i / 3) * Math.PI * 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
};
