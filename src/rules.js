export const FLOOR = 631;
export const CEILING = 100;
export function speedAt(seconds) { return Math.min(430, 230 + seconds * 2.4); }
export function integrateFlight(y, velocity, thrust, dt) {
  const nextVelocity = Math.max(-300, Math.min(350, velocity + (thrust ? -850 : 680) * dt));
  const nextY = Math.max(CEILING, Math.min(FLOOR - 28, y + nextVelocity * dt));
  return { y: nextY, velocity: nextY === CEILING || nextY === FLOOR - 28 ? 0 : nextVelocity };
}
export function intersects(player, box) {
  const x = Math.max(box.x, Math.min(player.x, box.x + box.w));
  const y = Math.max(box.y, Math.min(player.y, box.y + box.h));
  return (player.x-x)**2 + (player.y-y)**2 < player.radius**2;
}
export function scoreFor(distance, gifts, bonuses) { return Math.floor(distance) + gifts * 50 + bonuses * 200; }
export function patternAt(index) {
  // Alternating clear flight lanes; one obstacle per beat, never an impossible wall.
  const types = ['printer','cable','trolley','drone','cable','wrapper','zapper','drone','trolley','cable','wrapper','printer'];
  const type = types[index % types.length];
  const safeY = ['printer','trolley','wrapper'].includes(type) ? 335 : type === 'cable' ? 470 : type === 'zapper' ? 530 : 260;
  return { type, safeY, gap: Math.max(620, 780 - index * 5) };
}
