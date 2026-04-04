// A* pathfinder on a 64px tile grid
// Used by zombie AI to navigate around walls

interface ANode {
  gx: number; gy: number;
  g: number; h: number; f: number;
  parent: ANode | null;
}

export class Pathfinder {
  private wallGrid: Set<string>;
  private gridW: number;
  private gridH: number;

  constructor(wallGrid: Set<string>, mapSize: number) {
    this.wallGrid = wallGrid;
    this.gridW = Math.ceil(mapSize / 64) + 1;
    this.gridH = Math.ceil(mapSize / 64) + 1;
  }

  updateWallGrid(wallGrid: Set<string>) {
    this.wallGrid = wallGrid;
  }

  private key(gx: number, gy: number) { return `${gx},${gy}`; }

  private isBlocked(gx: number, gy: number): boolean {
    if (gx < 0 || gy < 0 || gx >= this.gridW || gy >= this.gridH) return true;
    return this.wallGrid.has(this.key(gx, gy));
  }

  // Returns world-coordinate waypoints (centres of grid cells), simplified
  findPath(startX: number, startY: number, endX: number, endY: number): { x: number; y: number }[] {
    let sx = Math.floor(startX / 64);
    let sy = Math.floor(startY / 64);
    const ex = Math.floor(endX / 64);
    const ey = Math.floor(endY / 64);

    if (sx === ex && sy === ey) return [];

    // If start is inside a wall, shift to free neighbor
    if (this.isBlocked(sx, sy)) {
      const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
      let found = false;
      for (const [dx, dy] of dirs) {
        if (!this.isBlocked(sx + dx, sy + dy)) { sx += dx; sy += dy; found = true; break; }
      }
      if (!found) return [];
    }

    const heuristic = (gx: number, gy: number) =>
      Math.abs(gx - ex) + Math.abs(gy - ey);

    const open: ANode[] = [];
    const closed = new Set<string>();
    const openMap = new Map<string, ANode>();

    const startNode: ANode = { gx: sx, gy: sy, g: 0, h: heuristic(sx, sy), f: heuristic(sx, sy), parent: null };
    open.push(startNode);
    openMap.set(this.key(sx, sy), startNode);

    const DIRS = [
      { dx: 1, dy: 0, cost: 1 }, { dx: -1, dy: 0, cost: 1 },
      { dx: 0, dy: 1, cost: 1 }, { dx: 0, dy: -1, cost: 1 },
      { dx: 1, dy: 1, cost: 1.41 }, { dx: -1, dy: 1, cost: 1.41 },
      { dx: 1, dy: -1, cost: 1.41 }, { dx: -1, dy: -1, cost: 1.41 },
    ];

    let iterations = 0;
    while (open.length > 0 && iterations++ < 600) {
      // Pop lowest f
      let minIdx = 0;
      for (let i = 1; i < open.length; i++) {
        if (open[i].f < open[minIdx].f) minIdx = i;
      }
      const cur = open.splice(minIdx, 1)[0];
      openMap.delete(this.key(cur.gx, cur.gy));
      closed.add(this.key(cur.gx, cur.gy));

      if (cur.gx === ex && cur.gy === ey) {
        // Reconstruct and smooth path
        const raw: { gx: number; gy: number }[] = [];
        let n: ANode | null = cur;
        while (n) { raw.unshift({ gx: n.gx, gy: n.gy }); n = n.parent; }
        return this.smoothPath(raw);
      }

      for (const dir of DIRS) {
        const nx = cur.gx + dir.dx;
        const ny = cur.gy + dir.dy;
        const nk = this.key(nx, ny);
        if (this.isBlocked(nx, ny) || closed.has(nk)) continue;
        // Diagonal: both adjacent cardinal cells must be free
        if (dir.dx !== 0 && dir.dy !== 0) {
          if (this.isBlocked(cur.gx + dir.dx, cur.gy) || this.isBlocked(cur.gx, cur.gy + dir.dy)) continue;
        }
        const g = cur.g + dir.cost;
        const existing = openMap.get(nk);
        if (existing) {
          if (g < existing.g) { existing.g = g; existing.f = g + existing.h; existing.parent = cur; }
        } else {
          const h = heuristic(nx, ny);
          const node: ANode = { gx: nx, gy: ny, g, h, f: g + h, parent: cur };
          open.push(node);
          openMap.set(nk, node);
        }
      }
    }

    return []; // No path found
  }

  // Remove redundant intermediate waypoints (string-pull / path smoothing)
  private smoothPath(raw: { gx: number; gy: number }[]): { x: number; y: number }[] {
    if (raw.length <= 2) {
      return raw.map(c => ({ x: c.gx * 64 + 32, y: c.gy * 64 + 32 }));
    }

    const result: { gx: number; gy: number }[] = [raw[0]];
    let anchor = 0;

    for (let i = 2; i < raw.length; i++) {
      if (!this.hasLineOfSight(raw[anchor].gx, raw[anchor].gy, raw[i].gx, raw[i].gy)) {
        result.push(raw[i - 1]);
        anchor = i - 1;
      }
    }
    result.push(raw[raw.length - 1]);

    // Skip first waypoint if very close to start (zombie already past it)
    return result.map(c => ({ x: c.gx * 64 + 32, y: c.gy * 64 + 32 }));
  }

  // Bresenham line-of-sight check on grid
  private hasLineOfSight(x0: number, y0: number, x1: number, y1: number): boolean {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let x = x0, y = y0;
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (x !== x1 || y !== y1) {
      if (this.isBlocked(x, y)) return false;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x += sx; }
      if (e2 < dx)  { err += dx; y += sy; }
    }
    return true;
  }
}
