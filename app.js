/* ============================================================
   Trail Quest — game logic
   ============================================================ */

// ---------- 1. Custom Blockly blocks for movement ----------

Blockly.Blocks['maze_move_forward'] = {
  init: function () {
    this.appendDummyInput().appendField('move forward ↑');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip('Move the explorer one step forward.');
  }
};
Blockly.JavaScript.forBlock['maze_move_forward'] = function () {
  return 'moveForward();\n';
};

Blockly.Blocks['maze_turn_left'] = {
  init: function () {
    this.appendDummyInput().appendField('turn left ↺');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip('Turn the explorer 90° to the left.');
  }
};
Blockly.JavaScript.forBlock['maze_turn_left'] = function () {
  return 'turnLeft();\n';
};

Blockly.Blocks['maze_turn_right'] = {
  init: function () {
    this.appendDummyInput().appendField('turn right ↻');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip('Turn the explorer 90° to the right.');
  }
};
Blockly.JavaScript.forBlock['maze_turn_right'] = function () {
  return 'turnRight();\n';
};

// ---------- 2. Toolbox: what block categories kids see ----------

const TOOLBOX = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Movement',
      colour: '160',
      contents: [
        { kind: 'block', type: 'maze_move_forward' },
        { kind: 'block', type: 'maze_turn_left' },
        { kind: 'block', type: 'maze_turn_right' }
      ]
    },
    {
      kind: 'category',
      name: 'Loops',
      colour: '210',
      contents: [
        {
          kind: 'block',
          type: 'controls_repeat_ext',
          inputs: {
            TIMES: { shadow: { type: 'math_number', fields: { NUM: 3 } } }
          }
        }
      ]
    }
  ]
};

// ---------- 3. Workspace setup ----------

const trailQuestTheme = Blockly.Theme.defineTheme('trailQuest', {
  base: Blockly.Themes.Classic,
  componentStyles: {
    toolboxBackgroundColour: '#1F3A32',
    toolboxForegroundColour: '#F3ECD8',
    flyoutBackgroundColour: '#24413C',
    flyoutForegroundColour: '#F3ECD8',
    flyoutOpacity: 1,
    scrollbarColour: '#5FB8D9',
    insertionMarkerColour: '#E8B84A',
    insertionMarkerOpacity: 0.4
  }
});

const workspace = Blockly.inject('blockly-div', {
  toolbox: TOOLBOX,
  trashcan: true,
  media: 'lib/media/',
  theme: trailQuestTheme,
  zoom: { controls: true, wheel: false, startScale: 0.95 },
  grid: { spacing: 22, length: 2, colour: '#2c4a41', snap: true }
});

// ---------- 4. Game state ----------

const DIRS = [
  { dr: -1, dc: 0, arrow: '⬆️' }, // 0 = up
  { dr: 0, dc: 1, arrow: '➡️' },  // 1 = right
  { dr: 1, dc: 0, arrow: '⬇️' },  // 2 = down
  { dr: 0, dc: -1, arrow: '⬅️' }  // 3 = left
];

let currentLevelIndex = 0;
let clearedLevels = new Set();
let hero = { row: 0, col: 0, dir: 1 };
let running = false;

const mazeGridEl = document.getElementById('maze-grid');
const bannerEl = document.getElementById('banner');
const trailEl = document.getElementById('trail');
const levelNoteEl = document.getElementById('level-note');
const btnRun = document.getElementById('btn-run');
const btnReset = document.getElementById('btn-reset');

// ---------- 5. Rendering ----------

function currentLevel() {
  return LEVELS[currentLevelIndex];
}

function renderTrail() {
  trailEl.innerHTML = '';
  LEVELS.forEach((level, i) => {
    const stone = document.createElement('div');
    stone.className = 'trail-stone';
    if (i === currentLevelIndex) stone.classList.add('active');
    if (clearedLevels.has(level.id)) stone.classList.add('cleared');
    stone.textContent = clearedLevels.has(level.id) ? '✓' : (i + 1);
    stone.title = level.title;
    stone.addEventListener('click', () => loadLevel(i));
    trailEl.appendChild(stone);

    if (i < LEVELS.length - 1) {
      const path = document.createElement('div');
      path.className = 'trail-path';
      trailEl.appendChild(path);
    }
  });
}

function renderMaze() {
  const level = currentLevel();
  mazeGridEl.innerHTML = '';
  mazeGridEl.style.gridTemplateColumns = `repeat(${level.cols}, 44px)`;
  mazeGridEl.style.gridTemplateRows = `repeat(${level.rows}, 44px)`;

  for (let r = 0; r < level.rows; r++) {
    for (let c = 0; c < level.cols; c++) {
      const cell = document.createElement('div');
      const isWall = level.grid[r][c] === 1;
      const isGoal = r === level.goal.row && c === level.goal.col;
      cell.className = 'cell ' + (isWall ? 'wall' : (isGoal ? 'goal' : 'path'));
      mazeGridEl.appendChild(cell);
    }
  }

  const heroEl = document.createElement('div');
  heroEl.className = 'hero';
  heroEl.id = 'hero';
  mazeGridEl.appendChild(heroEl);
  positionHero(true);
}

function positionHero(instant) {
  const heroEl = document.getElementById('hero');
  if (!heroEl) return;
  const cellSize = 44 + 3; // cell + gap
  const padding = 8;
  heroEl.style.transition = instant ? 'none' : 'top 0.28s ease, left 0.28s ease';
  heroEl.style.top = (padding + hero.row * cellSize + 6) + 'px';
  heroEl.style.left = (padding + hero.col * cellSize + 10) + 'px';
  heroEl.textContent = DIRS[hero.dir].arrow;
}

function setBanner(text, kind) {
  bannerEl.textContent = text;
  bannerEl.className = 'banner ' + (kind || 'idle');
}

function loadLevel(index) {
  currentLevelIndex = index;
  const level = currentLevel();
  hero = { row: level.start.row, col: level.start.col, dir: level.start.dir };
  levelNoteEl.textContent = `Level ${index + 1}: ${level.title} — ${level.hint}`;
  setBanner('Build your steps, then press Run.', 'idle');
  renderTrail();
  renderMaze();
  btnRun.disabled = false;
}

// ---------- 6. Running the generated code ----------

let actionQueue = [];

// These are the functions the Blockly-generated JavaScript calls.
// Instead of moving the hero immediately, they just queue an action,
// so we can animate one step at a time afterwards.
function moveForward() { actionQueue.push({ type: 'move' }); }
function turnLeft() { actionQueue.push({ type: 'turnLeft' }); }
function turnRight() { actionQueue.push({ type: 'turnRight' }); }

function runProgram() {
  if (running) return;
  const level = currentLevel();
  hero = { row: level.start.row, col: level.start.col, dir: level.start.dir };
  positionHero(true);

  actionQueue = [];
  let code;
  try {
    code = Blockly.JavaScript.workspaceToCode(workspace);
  } catch (e) {
    setBanner('Something went wrong reading your blocks.', 'bump');
    return;
  }

  if (!code.trim()) {
    setBanner('Drag some blocks in first!', 'idle');
    return;
  }

  // Cap total steps so an accidental huge repeat can't hang the browser.
  const MAX_STEPS = 300;
  let stepsCounted = 0;
  const guardedMove = moveForward, guardedLeft = turnLeft, guardedRight = turnRight;
  window.moveForward = () => { stepsCounted++; if (stepsCounted > MAX_STEPS) throw new Error('too many steps'); guardedMove(); };
  window.turnLeft = () => { stepsCounted++; if (stepsCounted > MAX_STEPS) throw new Error('too many steps'); guardedLeft(); };
  window.turnRight = () => { stepsCounted++; if (stepsCounted > MAX_STEPS) throw new Error('too many steps'); guardedRight(); };

  try {
    // eslint-disable-next-line no-new-func
    new Function(code)();
  } catch (e) {
    setBanner('Oops — check your blocks for a very long repeat.', 'bump');
    return;
  }

  running = true;
  btnRun.disabled = true;
  setBanner('Running...', 'idle');
  animateQueue();
}

function animateQueue() {
  if (actionQueue.length === 0) {
    finishRun();
    return;
  }
  const action = actionQueue.shift();
  const level = currentLevel();

  if (action.type === 'turnLeft') {
    hero.dir = (hero.dir + 3) % 4;
    positionHero(false);
  } else if (action.type === 'turnRight') {
    hero.dir = (hero.dir + 1) % 4;
    positionHero(false);
  } else if (action.type === 'move') {
    const d = DIRS[hero.dir];
    const nr = hero.row + d.dr;
    const nc = hero.col + d.dc;
    const outOfBounds = nr < 0 || nc < 0 || nr >= level.rows || nc >= level.cols;
    const hitWall = !outOfBounds && level.grid[nr][nc] === 1;

    if (outOfBounds || hitWall) {
      setBanner('Bumped into a wall! Press Reset and try again.', 'bump');
      running = false;
      btnRun.disabled = false;
      return; // stop the run here
    }
    hero.row = nr;
    hero.col = nc;
    positionHero(false);
  }

  setTimeout(() => animateQueue(), 320);
}

function finishRun() {
  const level = currentLevel();
  running = false;
  btnRun.disabled = false;
  if (hero.row === level.goal.row && hero.col === level.goal.col) {
    setBanner('🎉 You reached the flag!', 'win');
    clearedLevels.add(level.id);
    renderTrail();
  } else {
    setBanner('Not quite at the flag yet — adjust your blocks and try again.', 'idle');
  }
}

// ---------- 7. Wire up buttons ----------

btnRun.addEventListener('click', runProgram);
btnReset.addEventListener('click', () => loadLevel(currentLevelIndex));

// ---------- 8. Boot ----------

loadLevel(0);
