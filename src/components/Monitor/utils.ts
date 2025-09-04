
import {gsap} from 'gsap';
// ---- helpers (typed, no any) ----
type Pt = { x: number; y: number };
type Box = { x: number; y: number; w: number; h: number };

export function overlap(a: Box, b: Box, gap = 6) {
  return !(a.x + a.w + gap <= b.x ||
           b.x + b.w + gap <= a.x ||
           a.y + a.h + gap <= b.y ||
           b.y + b.h + gap <= a.y);
}

/** Plan non-overlapping positions inside container using rejection sampling */
export function planNonOverlapping(
  container: HTMLElement,
  items: HTMLElement[],
  padding = 8,
  gap = 6
): Pt[] {
  const innerW = container.clientWidth;   // content+padding width
  const innerH = container.clientHeight;  // content+padding height

  const placed: Box[] = [];
  const targets: Pt[] = [];

  items.forEach((el) => {
    const w = el.offsetWidth;
    const h = el.offsetHeight;

    const maxX = Math.max(0, innerW - w - padding * 2);
    const maxY = Math.max(0, innerH - h - padding * 2);

    let tries = 0;
    let x = 0, y = 0;
    do {
      x = padding + Math.random() * maxX;
      y = padding + Math.random() * maxY;
      tries++;
      // bail out if it’s too dense
      if (tries > 400) break;
    } while (placed.some(p => overlap(p, { x, y, w, h }, gap)));

    placed.push({ x, y, w, h });
    targets.push({ x, y });
  });

  return targets;
}

/** Convert a board-local (x,y) to the required translateX/translateY delta */
export function toTranslateWithin(
  container: HTMLElement,
  el: HTMLElement,
  dest: Pt
): Pt {
  const cRect = container.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const curLocalX = r.left - cRect.left;
  const curLocalY = r.top  - cRect.top;
  const tx = (gsap.getProperty(el, 'x') as number) || 0;
  const ty = (gsap.getProperty(el, 'y') as number) || 0;
  return { x: tx + (dest.x - curLocalX), y: ty + (dest.y - curLocalY) };
}
