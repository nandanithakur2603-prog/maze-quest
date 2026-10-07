/* ============================================================
   Trail Quest — level data
   To add a level: copy a block below, list the "path" cells
   (row, col) the explorer is allowed to walk on, and set the
   start position/direction and the goal. Everything else
   automatically becomes a wall.

   Directions:  0 = facing up (north)   1 = facing right (east)
                2 = facing down (south) 3 = facing left (west)
   ============================================================ */

function buildGrid(rows, cols, pathCells) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(1)); // 1 = wall
  pathCells.forEach(([r, c]) => { grid[r][c] = 0; }); // 0 = path
  return grid;
}

const LEVELS = [
  {
    id: 1,
    title: "First Steps",
    hint: "Move the explorer forward to reach the flag. Try dragging 3 'move forward' blocks.",
    rows: 3,
    cols: 4,
    start: { row: 1, col: 0, dir: 1 }, // facing east
    goal: { row: 1, col: 3 },
    grid: buildGrid(3, 4, [[1, 0], [1, 1], [1, 2], [1, 3]])
  },
  {
    id: 2,
    title: "Turn the Corner",
    hint: "The path turns! Move forward twice, turn right, then move forward to reach the flag.",
    rows: 4,
    cols: 4,
    start: { row: 0, col: 0, dir: 1 },
    goal: { row: 3, col: 2 },
    grid: buildGrid(4, 4, [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [3, 2]])
  },
  {
    id: 3,
    title: "The Long Walk",
    hint: "That's a long corridor... maybe a Repeat block can save you from dragging 7 blocks!",
    rows: 5,
    cols: 8,
    start: { row: 2, col: 0, dir: 1 },
    goal: { row: 2, col: 7 },
    grid: buildGrid(5, 8, [[2,0],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6],[2,7]])
  },
  {
    id: 4,
    title: "The Ring",
    hint: "Can you solve this ring using one Repeat block that moves forward twice and turns right?",
    rows: 3,
    cols: 3,
    start: { row: 0, col: 0, dir: 1 },
    goal: { row: 2, col: 0 },
    grid: buildGrid(3, 3, [[0,0],[0,1],[0,2],[1,2],[2,2],[2,1],[2,0]])
  }
];
