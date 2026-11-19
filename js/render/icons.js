/** Inline SVG icon set. Stroke-based, 24x24 grid, currentColor. */
const P = {
  belt: '<path d="M3 9h18M3 15h18" stroke-linecap="round"/><rect x="8.5" y="7" width="7" height="10" rx="1.6"/><path d="M12 10.5v3" stroke-linecap="round"/>',
  breastplate: '<path d="M12 3.2 5 6v5.6c0 4.3 3 7.3 7 9.2 4-1.9 7-4.9 7-9.2V6z"/><path d="M9 9.5c1.8-1.4 4.2-1.4 6 0M9 13.5h6" stroke-linecap="round"/>',
  shoes: '<path d="M4 17.5h9.5l4-1.6c1.6-.7 2.5-1.4 2.5-2.6 0-1-.8-1.6-1.8-1.4l-3.4.8V7.5a1.3 1.3 0 0 0-1.3-1.3H9.5A1.5 1.5 0 0 0 8 7.7v6.3H4z"/><path d="M4 20h16" stroke-linecap="round"/>',
  shield: '<path d="M12 3 4.5 5.7v5.9c0 4.9 3.2 8.1 7.5 9.6 4.3-1.5 7.5-4.7 7.5-9.6V5.7z"/><path d="M12 8v7M9 11h6" stroke-linecap="round"/>',
  helmet: '<path d="M4.5 14.5a7.5 7.5 0 0 1 15 0v1.2c0 .8-.7 1.4-1.5 1.4h-12c-.8 0-1.5-.6-1.5-1.4z"/><path d="M9 17v2.2M15 17v2.2M12 4.5v3.2" stroke-linecap="round"/>',
  sword: '<path d="M20 3.5 11 12.5M20 3.5c-1.4 4-2.5 6.2-4.2 7.6M20 3.5c-4 1.4-6.2 2.5-7.6 4.2" stroke-linecap="round"/><path d="M4.5 15.5 8 12l4 4-3.5 3.5a2 2 0 0 1-2.8 0l-1.2-1.2a2 2 0 0 1 0-2.8z"/><path d="M3.5 20.5l3-3" stroke-linecap="round"/>',
  prayer: '<path d="M12 3.5c1.4 0 2.4 1 2.4 2.3 0 1.6-1.2 2.3-1.2 3.4 0 1 .8 1.4.8 2.3 0 1.2-1 1.8-2 1.8s-2-.6-2-1.8c0-.9.8-1.3.8-2.3 0-1.1-1.2-1.8-1.2-3.4C9.6 4.5 10.6 3.5 12 3.5z"/><path d="M8.6 13.4 6.2 19c-.3.9.4 1.6 1.2 1.4l3.3-.9M15.4 13.4l2.4 5.6c.3.9-.4 1.6-1.2 1.4l-3.3-.9" stroke-linecap="round"/>',
  flame: '<path d="M12 21c3.6 0 6-2.4 6-5.6 0-4.3-4.3-6.2-3.4-10.4-2.4.8-4 2.9-4 5.2 0 1.5-.8 2.2-1.6 2.2-.9 0-1.6-.8-1.6-1.9C6.4 11.9 6 13.5 6 15.4 6 18.6 8.4 21 12 21z"/>',
  clock: '<circle cx="12" cy="12" r="8.2"/><path d="M12 7.4V12l3.2 2" stroke-linecap="round"/>',
  star: '<path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z"/>',
  book: '<path d="M4 5.2c0-.7.5-1.2 1.2-1.2H10c1.1 0 2 .9 2 2v13c0-.9-.8-1.6-1.8-1.6H5.2c-.7 0-1.2-.5-1.2-1.2z"/><path d="M20 5.2c0-.7-.5-1.2-1.2-1.2H14c-1.1 0-2 .9-2 2v13c0-.9.8-1.6 1.8-1.6h5c.7 0 1.2-.5 1.2-1.2z"/>',
  play: '<path d="M8 5.4v13.2l11-6.6z"/>',
  pause: '<rect x="7.5" y="5.5" width="3.4" height="13" rx="1"/><rect x="13.1" y="5.5" width="3.4" height="13" rx="1"/>',
  gear: '<circle cx="12" cy="12" r="3.1"/><path d="M12 3.2v2.3M12 18.5v2.3M20.8 12h-2.3M5.5 12H3.2M18.2 5.8l-1.6 1.6M7.4 16.6l-1.6 1.6M18.2 18.2l-1.6-1.6M7.4 7.4 5.8 5.8" stroke-linecap="round"/>',
  close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke-linecap="round"/>',
  chevron: '<path d="M9.5 7l5 5-5 5" stroke-linecap="round" stroke-linejoin="round"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round"/>',
  x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke-linecap="round"/>',
  shieldHalf: '<path d="M12 3 4.5 5.7v5.9c0 4.9 3.2 8.1 7.5 9.6 4.3-1.5 7.5-4.7 7.5-9.6V5.7z"/><path d="M12 4v15" stroke-linecap="round" opacity=".45"/>',
  hands: '<path d="M7.5 13V7.8c0-.8.6-1.4 1.4-1.4s1.4.6 1.4 1.4V12M10.3 12V6.4c0-.8.6-1.4 1.4-1.4s1.4.6 1.4 1.4V12M13.1 12V7.4c0-.8.6-1.4 1.4-1.4s1.4.6 1.4 1.4V13M15.9 10.4c0-.7.6-1.2 1.3-1.2.6 0 1.2.5 1.2 1.2v4.4c0 3.3-2.4 5.4-5.6 5.4h-1c-2 0-3.4-.8-4.5-2.4L4.6 14c-.5-.7-.4-1.6.3-2.1.6-.4 1.4-.3 1.9.3l.7.8" stroke-linecap="round" stroke-linejoin="round"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.4M12 18.8v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" stroke-linecap="round"/>',
  moon: '<path d="M20 14.2A8 8 0 0 1 9.8 4 8.4 8.4 0 1 0 20 14.2z"/>',
  wave: '<path d="M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke-linecap="round"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4"/><path d="M12 1.8v3M12 19.2v3M1.8 12h3M19.2 12h3" stroke-linecap="round"/>',
  scroll: '<path d="M6.5 4.5h9.2a2 2 0 0 1 2 2v11a2 2 0 0 0 2 2H8.5a2 2 0 0 1-2-2z"/><path d="M6.5 4.5a2 2 0 0 0-2 2v1.8h2M10 9h5M10 12.5h5M10 16h3" stroke-linecap="round"/>',
  save: '<path d="M5 4.5h11L19.5 8v11.5h-14z"/><path d="M8.5 4.5v5h6v-5M8.5 19.5v-6h7v6" stroke-linecap="round" stroke-linejoin="round"/>',
  trash: '<path d="M5.5 7h13M9.5 7V5.2c0-.6.5-1 1-1h3c.6 0 1 .4 1 1V7M7 7l.8 12.2c0 .6.5 1 1 1h6.4c.6 0 1-.4 1-1L17 7" stroke-linecap="round" stroke-linejoin="round"/>',
  users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke-linecap="round"/><path d="M16 5.6a3 3 0 0 1 0 5.8M17.5 14.8c2 .5 3.5 2.2 3.5 4.7" stroke-linecap="round"/>',
  arrowUp: '<path d="M12 19V5M6 11l6-6 6 6" stroke-linecap="round" stroke-linejoin="round"/>',
  arrowDown: '<path d="M12 5v14M6 13l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>',
  info: '<circle cx="12" cy="12" r="8.4"/><path d="M12 11v5.4" stroke-linecap="round"/><circle cx="12" cy="8" r=".9" fill="currentColor" stroke="none"/>',
  flag: '<path d="M6 3.5v17" stroke-linecap="round"/><path d="M6 4.5h11.5l-2 4 2 4H6z"/>',
  spark: '<path d="M12 3.5l1.7 5 5 1.7-5 1.7-1.7 5-1.7-5-5-1.7 5-1.7z"/>'
};

export function icon(name, size = 20, cls = '') {
  const path = P[name] || P.star;
  return `<svg class="ico ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false">${path}</svg>`;
}

export const ICON_NAMES = Object.keys(P);
