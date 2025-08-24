// Pong Game Constants
const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_RADIUS = 8;

const PLAYER_X = 10;
const AI_X = WIDTH - PADDLE_WIDTH - 10;

// Initial State
let playerY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let aiY = HEIGHT / 2 - PADDLE_HEIGHT / 2;

let ball = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
  speed: 5,
  velX: 5,
  velY: 3,
  radius: BALL_RADIUS
};

// Draw Functions
function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
}

function drawNet() {
  ctx.fillStyle = "#fff";
  for (let i = 0; i < HEIGHT; i += 20) {
    ctx.fillRect(WIDTH / 2 - 1, i, 2, 10);
  }
}

function draw() {
  // Clear canvas
  drawRect(0, 0, WIDTH, HEIGHT, "#000");

  // Draw net
  drawNet();

  // Draw paddles
  drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, "#fff");
  drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, "#fff");

  // Draw ball
  drawCircle(ball.x, ball.y, ball.radius, "#fff");
}

// Game Logic
function resetBall() {
  ball.x = WIDTH / 2;
  ball.y = HEIGHT / 2;
  ball.velX = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
  ball.velY = (Math.random() * 4 - 2);
}

function collisionDetect(paddleX, paddleY) {
  return (
    ball.x - ball.radius < paddleX + PADDLE_WIDTH &&
    ball.x + ball.radius > paddleX &&
    ball.y + ball.radius > paddleY &&
    ball.y - ball.radius < paddleY + PADDLE_HEIGHT
  );
}

function update() {
  // Move ball
  ball.x += ball.velX;
  ball.y += ball.velY;

  // Wall collisions
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > HEIGHT) {
    ball.velY = -ball.velY;
  }

  // Player paddle collision
  if (collisionDetect(PLAYER_X, playerY)) {
    ball.velX = -ball.velX;
    // Add some "spin" based on where the ball hits the paddle
    let collidePoint = (ball.y - (playerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
    ball.velY = ball.speed * collidePoint;
  }

  // AI paddle collision
  if (collisionDetect(AI_X, aiY)) {
    ball.velX = -ball.velX;
    let collidePoint = (ball.y - (aiY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
    ball.velY = ball.speed * collidePoint;
  }

  // Out of bounds (score)
  if (ball.x - ball.radius < 0 || ball.x + ball.radius > WIDTH) {
    resetBall();
  }

  // Move AI paddle (basic AI)
  let aiCenter = aiY + PADDLE_HEIGHT / 2;
  if (ball.y < aiCenter - 10) {
    aiY -= 4;
  } else if (ball.y > aiCenter + 10) {
    aiY += 4;
  }
  // Prevent AI paddle from going out of bounds
  aiY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, aiY));
}

// Mouse control for player paddle
canvas.addEventListener('mousemove', function(evt) {
  let rect = canvas.getBoundingClientRect();
  let mouseY = evt.clientY - rect.top;
  playerY = mouseY - PADDLE_HEIGHT / 2;
  // Prevent paddle from going out of bounds
  playerY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, playerY));
});

// Game Loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start game
resetBall();
gameLoop();