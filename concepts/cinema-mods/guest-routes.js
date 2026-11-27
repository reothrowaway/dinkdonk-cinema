// Guest foot positions in layout 3, in the same [u,v] tiles as a native walker plan.
// out10s and out10t share the floor plan. The Moody bonsai is on top of the snack case.
const FOOT = 0.14;
const TURN = 0.065; // leave space between a turn and the nearest padded edge
const FIELD = [-8, 0.13, 20, 10.7]; // public carpet and near sidewalk, up to the curb

function pad([u0, v0, u1, v1], distance) {
  return [u0 - distance, v0 - distance, u1 + distance, v1 + distance];
}

// The manifests give horizontal footprints. A canopy/header is overhead. The full
// bus_stop bound includes its roof and shadow, so use its actual ground fixtures
// from build_pass10_draft6.py instead.
const furniture = [
  [4.55, 3.55, 5, 4],                 // usher podium
  [3.80, 5, 4.415, 8.41],             // box office
  [5.60, 3.50, 11.601, 4.615],        // snack counter and the staff-only space behind it
  [11.68, 3.40, 12.18, 3.88],         // jukebox
  [12.15, 4.92, 12.67, 5.14], [7.15, 8.42, 7.67, 8.64], // lobby standees
  [11.20, 6, 12.60, 6.40], [11.95, 7.50, 12.70, 8.25], // bench, claw cabinet
  [5.095, 7.695, 9.305, 7.905], [5.795, 6.895, 9.305, 7.105], // queue ropes
  [3.36, 0.22, 3.84, 0.38], [6.94, 0.21, 7.42, 0.37], // screen-hall standees
  [10.265, 0.105, 10.46, 0.25],       // extinguisher
  [4.995, 10.295, 5.145, 10.445],     // street lamp
  [-0.15, 9.11, 2.87, 9.25],          // glazed back and rear post feet
  [-0.15, 9.11, -0.01, 10.17], [2.73, 9.11, 2.87, 10.17], // glazed sides
  [1.72, 9.245, 2.57, 9.59], [2.89, 9.34, 3.27, 9.72], // shelter bench and bin
  [3.00, 10.17, 3.08, 10.25],         // stop pole
  [10.05, 6.25, 10.35, 6.55],        // reserve the wet-floor sign position even between appearances
];
const fixed = [
  ...furniture.map(box => pad(box, FOOT)),
  // The palm's footprint already includes its fronds. Keep the art's four
  // exported jukebox dance marks (the nearest is only 0.077 tile beyond it).
  pad([12.074, 3.117, 13.115, 4.103], .05),
  [-9, -1, 0.16, 9.18], [12.99, -1, 21, 9.18], // outside the building
  [-1, 2.72, 3.30, 9.16],              // restroom and left partition
  [3.15, 4.92, 4.48, 8.48],           // staff side of the ticket windows
  [4.26, 1.78, 14, 3.65],             // stay on the visible corridor carpet; access via GATE_OUT
  [3, 8.81, 8.85, 9.21], [10.15, 8.81, 13.05, 9.21], // front glazing and entrance posts
  [8.47, 8.34, 8.92, 9.05], [10.08, 8.34, 10.53, 9.05], // open door leaves
];
const inside = ([u,v], [u0,v0,u1,v1]) => u >= u0 && u <= u1 && v >= v0 && v <= v1;
const point = p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite);
const safe = (p, boxes) => inside(p, FIELD) && !boxes.some(box => inside(p, box));
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// Slab intersection includes tangent edges and corners. Every returned leg is
// tested continuously against the solids, including the two unsnapped endpoints.
function crosses(a, b, box) {
  let enter = 0, leave = 1;
  for (let axis = 0; axis < 2; axis++) {
    const delta = b[axis] - a[axis];
    const min = box[axis], max = box[axis + 2];
    if (delta === 0) {
      if (a[axis] < min || a[axis] > max) return false;
    } else {
      const near = (min - a[axis]) / delta, far = (max - a[axis]) / delta;
      enter = Math.max(enter, Math.min(near, far));
      leave = Math.min(leave, Math.max(near, far));
      if (enter > leave) return false;
    }
  }
  return true;
}
const visible = (a, b, boxes) => !boxes.some(box => crosses(a, b, box));

// Once per floor configuration: build a visibility graph of safe turns, including
// the native gate, arrival and service waypoints. An incident can route many guests
// against the same graph; per guest only its start and destination need connecting.
function makeFloor(extra) {
  const boxes = fixed.concat(extra.map(box => pad(box, FOOT)));
  const nodes = [
    [9.5, 9.48], [9.5, 8.58], [9.6, 7.4], [4.85, 7.4], [5.2, 6.45],
    [8.6, 6.6], [11.9, 6.66], [12.95, 7], [12.95, 8.5], [4.5, 4.6],
    [3.7, 3.7], [3.75, 2.45], [4.4, 1.4], [1.4, 1.4], [3.55, 10.53],
  ];
  for (const box of boxes) {
    const [u0, v0, u1, v1] = pad(box, TURN);
    nodes.push([u0,v0], [u1,v0], [u0,v1], [u1,v1]);
  }
  const turns = nodes.filter(p => safe(p, boxes));
  const edges = turns.map(() => []);
  for (let i = 0; i < turns.length; i++) {
    for (let j = 0; j < i; j++) {
      if (!visible(turns[i], turns[j], boxes)) continue;
      const length = distance(turns[i], turns[j]);
      edges[i].push([j, length]);
      edges[j].push([i, length]);
    }
  }
  return { boxes, turns, edges };
}

let lastKey, lastFloor;
function floorFor(anchors) {
  if (anchors?.layout !== undefined && anchors.layout !== 3) return null;
  const extra = anchors?.obstacles ?? [];
  if (!Array.isArray(extra) || extra.length > 24 || !extra.every(b =>
    Array.isArray(b) && b.length === 4 && b.every(Number.isFinite) && b[0] <= b[2] && b[1] <= b[3])) return null;
  const key = extra.length ? JSON.stringify(extra) : '';
  if (key !== lastKey) {
    lastFloor = makeFloor(extra);
    lastKey = key;
  }
  return lastFloor;
}

export function walkableMark(targetUV, anchors) {
  if (!point(targetUV)) return null;
  const floor = floorFor(anchors);
  if (!floor) return null;
  if (safe(targetUV, floor.boxes)) return targetUV.slice();
  // A staging offset may touch the edge of a fixture. Keep any adjustment local
  // and on the same side of the front glazing/corridor partition as the request.
  const [u, v] = targetUV;
  for (let ring = 1; ring <= 8; ring++) {
    for (let i = 0; i < 24; i++) {
      const angle = i * Math.PI / 12;
      const p = [u + ring * .1 * Math.cos(angle), v + ring * .1 * Math.sin(angle)];
      if ((v >= 9.05) !== (p[1] >= 9.05) || (v <= 2.72) !== (p[1] <= 2.72)) continue;
      if (safe(p, floor.boxes)) return p;
    }
  }
  return null;
}

export function guestRoute(fromUV, toUV, anchors) {
  if (!point(fromUV) || !point(toUV)) return null;
  const floor = floorFor(anchors);
  if (!floor) return null;
  const { boxes, turns, edges } = floor;
  if (!safe(fromUV, boxes) || !safe(toUV, boxes)) return null;
  if (visible(fromUV, toUV, boxes)) return [fromUV.slice(), toUV.slice()];
  const n = turns.length, cost = new Float64Array(n), parent = new Int16Array(n);
  const visited = new Uint8Array(n), remaining = turns.map(p => distance(p, toUV));
  cost.fill(Infinity);
  parent.fill(-1);
  for (let i = 0; i < n; i++) {
    if (visible(fromUV, turns[i], boxes)) cost[i] = distance(fromUV, turns[i]);
  }
  // A* with a Euclidean lower bound. The first expanded turn with an unobstructed
  // final leg has the lowest complete path cost among all remaining turns.
  for (let step = 0; step < n; step++) {
    let best = -1, score = Infinity;
    for (let i = 0; i < n; i++) {
      const guess = cost[i] + remaining[i];
      if (!visited[i] && guess < score) { best = i; score = guess; }
    }
    if (best < 0) return null;
    if (visible(turns[best], toUV, boxes)) {
      const route = [toUV.slice()];
      for (let i = best; i >= 0; i = parent[i]) route.push(turns[i].slice());
      route.push(fromUV.slice());
      return route.reverse();
    }
    visited[best] = 1;
    for (const [next, length] of edges[best]) {
      const candidate = cost[best] + length;
      if (candidate >= cost[next]) continue;
      cost[next] = candidate;
      parent[next] = best;
    }
  }
  return null;
}
