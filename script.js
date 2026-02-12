const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("best-score");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const pauseBtn = document.getElementById("pause");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const speedMs = 120;

let snake;
let direction;
let nextDirection;
let food;
let score;
let bestScore = Number(localStorage.getItem("snake-best-score") || 0);
let isGameOver;
let isPaused;

bestScoreEl.textContent = String(bestScore);

function randomFoodPosition() {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake.some((part) => part.x === position.x && part.y === position.y));
  return position;
}

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  food = randomFoodPosition();
  score = 0;
  isGameOver = false;
  isPaused = false;
  scoreEl.textContent = "0";
  pauseBtn.textContent = "Pause";
  statusEl.textContent = "Use arrow keys or WASD to play.";
}

function setDirection(x, y) {
  if (isGameOver) return;
  if (direction.x === -x && direction.y === -y) return;
  nextDirection = { x, y };
}

function update() {
  if (isGameOver || isPaused) return;

  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  if (head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount) {
    endGame();
    return;
  }

  if (snake.some((part) => part.x === head.x && part.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreEl.textContent = String(score);
    food = randomFoodPosition();

    if (score > bestScore) {
      bestScore = score;
      bestScoreEl.textContent = String(bestScore);
      localStorage.setItem("snake-best-score", String(bestScore));
    }
  } else {
    snake.pop();
  }
}

function endGame() {
  isGameOver = true;
  statusEl.textContent = "Game over. Press Restart or Enter.";
}

function drawTile(x, y, fillStyle) {
  ctx.fillStyle = fillStyle;
  ctx.fillRect(x * gridSize, y * gridSize, gridSize - 1, gridSize - 1);
}

function draw() {
  ctx.fillStyle = "#0f1a23";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawTile(food.x, food.y, "#e35f5f");

  snake.forEach((part, index) => {
    drawTile(part.x, part.y, index === 0 ? "#b8f26b" : "#78ca57");
  });
}

function tick() {
  update();
  draw();
}

function togglePause() {
  if (isGameOver) return;
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Resume" : "Pause";
  statusEl.textContent = isPaused ? "Paused" : "Use arrow keys or WASD to play.";
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "enter", "w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
  }

  switch (key) {
    case "arrowup":
    case "w":
      setDirection(0, -1);
      break;
    case "arrowdown":
    case "s":
      setDirection(0, 1);
      break;
    case "arrowleft":
    case "a":
      setDirection(-1, 0);
      break;
    case "arrowright":
    case "d":
      setDirection(1, 0);
      break;
    case " ":
      togglePause();
      break;
    case "enter":
      if (isGameOver) resetGame();
      break;
    default:
      break;
  }
});

restartBtn.addEventListener("click", resetGame);
pauseBtn.addEventListener("click", togglePause);

resetGame();
draw();
setInterval(tick, speedMs);
