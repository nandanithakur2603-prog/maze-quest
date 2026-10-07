/* ============================================================
   Teach Robo — a kid-friendly nearest-neighbor classifier demo
   ============================================================
   Concept: kids place labeled example fruits on a 2D map
   (Size vs Sweetness). To predict a new fruit, Robo finds the
   closest example it has already seen and copies its label.
   This is a real machine-learning idea (k-nearest-neighbors,
   k=1) taught without any of the underlying math showing.
   ============================================================ */

const SWEET_EMOJIS = ['🍎', '🍇', '🍉', '🍓', '🍑'];
const SOUR_EMOJIS = ['🍋', '🍊', '🥝', '🍏'];

// Hidden quiz fruits: true label is simply "sweetness > 50".
// Kept off the visible map so kids can't just memorize positions.
const MYSTERY_FRUITS = [
  { emoji: '🍉', x: 75, y: 80 },
  { emoji: '🍋', x: 20, y: 15 },
  { emoji: '🍇', x: 40, y: 65 },
  { emoji: '🥝', x: 60, y: 25 },
  { emoji: '🍓', x: 30, y: 75 },
  { emoji: '🍊', x: 85, y: 35 }
];

let trainingPoints = []; // { x, y, label: 'sweet'|'sour', emoji }
let mode = null;         // 'sweet' | 'sour' | 'test' | null

const plotFrame = document.getElementById('plot-frame');
const canvas = document.getElementById('plot-canvas');
const ctx = canvas.getContext('2d');
const explainBox = document.getElementById('explain-box');
const statExamples = document.getElementById('stat-examples');
const statAccuracy = document.getElementById('stat-accuracy');
const quizStrip = document.getElementById('quiz-strip');

const modeButtons = {
  sweet: document.getElementById('mode-sweet'),
  sour: document.getElementById('mode-sour'),
  test: document.getElementById('mode-test')
};

// ---------- Nearest-neighbor core ----------

function trueLabel(y) {
  return y > 50 ? 'sweet' : 'sour';
}

function nearestNeighbor(x, y) {
  if (trainingPoints.length === 0) return null;
  let best = null;
  let bestDist = Infinity;
  for (const p of trainingPoints) {
    const d = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (d < bestDist) { bestDist = d; best = p; }
  }
  return best;
}

// ---------- Mode buttons ----------

function setMode(newMode) {
  mode = (mode === newMode) ? null : newMode;
  Object.entries(modeButtons).forEach(([key, btn]) => {
    btn.classList.toggle('armed', mode === key);
  });
  if (!mode) {
    explainBox.textContent = '';
  } else if (mode === 'test') {
    explainBox.textContent = 'Click anywhere on the map to test a new fruit.';
  } else {
    explainBox.textContent = `Click anywhere on the map to place a ${mode} example.`;
  }
}

modeButtons.sweet.addEventListener('click', () => setMode('sweet'));
modeButtons.sour.addEventListener('click', () => setMode('sour'));
modeButtons.test.addEventListener('click', () => setMode('test'));

// ---------- Plot interaction ----------

plotFrame.addEventListener('click', (e) => {
  if (!mode) {
    explainBox.textContent = 'Pick a mode above first — Add Sweet, Add Sour, or Test.';
    return;
  }
  const rect = plotFrame.getBoundingClientRect();
  const relX = (e.clientX - rect.left) / rect.width;
  const relY = (e.clientY - rect.top) / rect.height;
  const x = Math.max(0, Math.min(100, relX * 100));
  const y = Math.max(0, Math.min(100, (1 - relY) * 100)); // invert so top = sweet

  clearTestVisuals();

  if (mode === 'sweet' || mode === 'sour') {
    const emojiPool = mode === 'sweet' ? SWEET_EMOJIS : SOUR_EMOJIS;
    const emoji = emojiPool[Math.floor(Math.random() * emojiPool.length)];
    trainingPoints.push({ x, y, label: mode, emoji });
    drawPoint(x, y, mode, emoji);
    updateStats();
    drawBoundary();
    explainBox.textContent = `Added a ${mode} example ${emoji}. Keep going, or switch to Test!`;
  } else if (mode === 'test') {
    runTest(x, y);
  }
});

// ---------- Drawing training points ----------

function drawPoint(x, y, label, emoji) {
  const marker = document.createElement('div');
  marker.className = `plot-point ${label}`;
  marker.style.left = x + '%';
  marker.style.top = (100 - y) + '%';
  marker.textContent = emoji;
  plotFrame.appendChild(marker);
}

let testMarkerEl = null;
let nnLineEl = null;

function clearTestVisuals() {
  if (testMarkerEl) { testMarkerEl.remove(); testMarkerEl = null; }
  if (nnLineEl) { nnLineEl.remove(); nnLineEl = null; }
}

function runTest(x, y) {
  const neighbor = nearestNeighbor(x, y);

  if (!neighbor) {
    explainBox.textContent = "Robo hasn't learned anything yet — add a few examples first!";
    return;
  }

  // Draw the test marker
  testMarkerEl = document.createElement('div');
  testMarkerEl.className = `plot-point test-marker ${neighbor.label}`;
  testMarkerEl.style.left = x + '%';
  testMarkerEl.style.top = (100 - y) + '%';
  testMarkerEl.textContent = neighbor.label === 'sweet' ? '🍭' : '🍋';
  plotFrame.appendChild(testMarkerEl);

  // Draw a line to the neighbor it copied
  const rect = plotFrame.getBoundingClientRect();
  const ax = (x / 100) * rect.width;
  const ay = ((100 - y) / 100) * rect.height;
  const bx = (neighbor.x / 100) * rect.width;
  const by = ((100 - neighbor.y) / 100) * rect.height;
  const dx = bx - ax;
  const dy = by - ay;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  nnLineEl = document.createElement('div');
  nnLineEl.className = 'nn-line';
  nnLineEl.style.left = ax + 'px';
  nnLineEl.style.top = ay + 'px';
  nnLineEl.style.width = length + 'px';
  nnLineEl.style.transform = `rotate(${angle}deg)`;
  plotFrame.appendChild(nnLineEl);

  explainBox.textContent =
    `Robo says: ${neighbor.label === 'sweet' ? 'Sweet 🍭' : 'Sour 🍋'} — ` +
    `because the closest example it knows is that ${neighbor.emoji}.`;
}

// ---------- Decision-boundary shading ----------

function drawBoundary() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (trainingPoints.length === 0) return;

  const cells = 24;
  const cellSize = canvas.width / cells;

  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      const cx = ((col + 0.5) / cells) * 100;
      const cy = 100 - ((row + 0.5) / cells) * 100; // invert: row 0 = top = sweet
      const neighbor = nearestNeighbor(cx, cy);
      ctx.fillStyle = neighbor.label === 'sweet'
        ? 'rgba(232, 184, 74, 0.16)'
        : 'rgba(95, 184, 217, 0.16)';
      ctx.fillRect(col * cellSize, row * cellSize, cellSize + 0.5, cellSize + 0.5);
    }
  }
}

// ---------- Stats ----------

function updateStats() {
  statExamples.textContent = trainingPoints.length;
}

// ---------- Quiz ----------

function renderQuizStrip(results) {
  quizStrip.innerHTML = '';
  MYSTERY_FRUITS.forEach((fruit, i) => {
    const item = document.createElement('div');
    item.className = 'quiz-item';
    const result = results ? results[i] : null;
    if (result) {
      item.classList.add(result.correct ? 'correct' : 'incorrect');
      item.textContent = fruit.emoji;
      const badge = document.createElement('span');
      badge.className = 'quiz-result';
      badge.textContent = result.correct ? '✅' : '❌';
      item.appendChild(badge);
    } else {
      item.textContent = '❔';
    }
    quizStrip.appendChild(item);
  });
}

document.getElementById('btn-quiz').addEventListener('click', () => {
  if (trainingPoints.length === 0) {
    explainBox.textContent = 'Add some training examples before quizzing Robo!';
    return;
  }
  let correctCount = 0;
  const results = MYSTERY_FRUITS.map((fruit) => {
    const neighbor = nearestNeighbor(fruit.x, fruit.y);
    const predicted = neighbor.label;
    const actual = trueLabel(fruit.y);
    const correct = predicted === actual;
    if (correct) correctCount++;
    return { correct };
  });
  renderQuizStrip(results);
  const pct = Math.round((correctCount / MYSTERY_FRUITS.length) * 100);
  statAccuracy.textContent = `${correctCount}/${MYSTERY_FRUITS.length}`;
  explainBox.textContent = `Robo got ${correctCount} out of ${MYSTERY_FRUITS.length} right (${pct}%). Add more examples to help it improve!`;
});

// ---------- Reset ----------

document.getElementById('btn-reset').addEventListener('click', () => {
  trainingPoints = [];
  mode = null;
  Object.values(modeButtons).forEach((btn) => btn.classList.remove('armed'));
  document.querySelectorAll('.plot-point, .nn-line').forEach((el) => el.remove());
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateStats();
  statAccuracy.textContent = '—';
  renderQuizStrip(null);
  explainBox.textContent = 'Robo has forgotten everything. Teach it again!';
});

// ---------- Boot ----------

renderQuizStrip(null);
updateStats();
