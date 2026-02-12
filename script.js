const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const statusEl = document.getElementById('status');

const gridSize = 20;
const tiles = canvas.width / gridSize;

const STORAGE_KEY = 'snake-best-score';
let best = Number(localStorage.getItem(STORAGE_KEY) || 0);
bestEl.textContent = String(best);

let snake;
let dir;
let nextDir;
let food;
let score;
let running;
let lastTick = 0;
const tickMs = 110;

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score = 0;
  running = true;
  statusEl.textContent = '';
  scoreEl.textContent = '0';
  placeFood();
}

function placeFood() {
  let x;
  let y;
  do {
    x = Math.floor(Math.random() * tiles);
    y = Math.floor(Math.random() * tiles);
  } while (snake.some((s) => s.x === x && s.y === y));
  food = { x, y };
}

function isOpposite(a, b) {
  return a.x === -b.x && a.y === -b.y;
}

function gameOver() {
  running = false;
  statusEl.textContent = 'Game Over - Press Space to restart';
}

function update() {
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  const hitWall = head.x < 0 || head.x >= tiles || head.y < 0 || head.y >= tiles;
  const willEat = head.x === food.x && head.y === food.y;
  const bodyToCheck = willEat ? snake : snake.slice(0, -1);
  const hitSelf = bodyToCheck.some((s) => s.x === head.x && s.y === head.y);
  if (hitWall || hitSelf) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if (willEat) {
    score += 1;
    scoreEl.textContent = String(score);
    if (score > best) {
      best = score;
      bestEl.textContent = String(best);
      localStorage.setItem(STORAGE_KEY, String(best));
    }
    placeFood();
  } else {
    snake.pop();
  }
}

function draw() {
  ctx.fillStyle = '#0a0b10';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#151722';
  for (let i = 0; i <= tiles; i += 1) {
    const p = i * gridSize;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(canvas.width, p);
    ctx.stroke();
  }

  ctx.fillStyle = '#f87171';
  ctx.fillRect(food.x * gridSize + 2, food.y * gridSize + 2, gridSize - 4, gridSize - 4);

  snake.forEach((part, i) => {
    ctx.fillStyle = i === 0 ? '#4ade80' : '#22c55e';
    ctx.fillRect(part.x * gridSize + 2, part.y * gridSize + 2, gridSize - 4, gridSize - 4);
  });
}

function loop(timestamp) {
  if (running && timestamp - lastTick >= tickMs) {
    lastTick = timestamp;
    update();
  }
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  const map = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 }
  };

  if (key === ' ' && !running) {
    event.preventDefault();
    lastTick = 0;
    resetGame();
    return;
  }

  const next = map[key];
  if (!next || !running) return;
  event.preventDefault();
  if (isOpposite(next, dir)) return;
  nextDir = next;
});

resetGame();
requestAnimationFrame(loop);
