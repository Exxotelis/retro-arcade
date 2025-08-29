// src/components/PongMini.jsx
import React, { useEffect, useRef } from "react";
import useInput from "../hooks/useInput";
import useIsTouch from "../hooks/useIsTouch";

/**
 * Optional props:
 * - title?: string
 * - onExit?: () => void
 * - externalState?: { up, down, left, right, A, B, start, select }  // αν θες να περάσεις state απ' έξω (π.χ. από Modal)
 * - externalSwipeHandlers?: React DOM handlers                    // αν θες swipe handlers απ' έξω (δεν είναι υποχρεωτικό)
 */
export default function PongMini({ title = "Pong", onExit, externalState, externalSwipeHandlers }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const isTouch = useIsTouch();

  // Αν δεν μας δώσουν external state, χρησιμοποιούμε το κοινό hook
  const fallback = useInput();
  const inputState = externalState ?? fallback.state;

  // ---- Game state refs ----
  const playerYRef = useRef(0);
  const aiYRef = useRef(0);
  const ballRef = useRef({ x: 0, y: 0, speed: 5, velX: 5, velY: 3, radius: 8 });

  const widthRef = useRef(480);
  const heightRef = useRef(320);

  const PADDLE_WIDTH = 10;
  const PADDLE_HEIGHT = 80;
  const BALL_RADIUS = 8;
  const PLAYER_X = 10;

  const lastMouseYRef = useRef(null);

  // Resize canvas to container with DPR
  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // λογικές ελάχιστες/μέγιστες
      const cssW = Math.max(320, Math.floor(rect.width));
      const cssH = Math.max(220, Math.floor(rect.height));

      widthRef.current = cssW;
      heightRef.current = cssH;

      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // reset positions when resize (center)
      playerYRef.current = cssH / 2 - PADDLE_HEIGHT / 2;
      aiYRef.current = cssH / 2 - PADDLE_HEIGHT / 2;
      resetBall();
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mouse move for desktop
  useEffect(() => {
    const canvas = canvasRef.current;
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      lastMouseYRef.current = mouseY;
    };
    // σε desktop μόνο
    if (!isTouch) {
      canvas.addEventListener("mousemove", onMouseMove, { passive: true });
      return () => canvas.removeEventListener("mousemove", onMouseMove);
    }
  }, [isTouch]);

  function resetBall() {
    const W = widthRef.current;
    const H = heightRef.current;
    const ball = ballRef.current;
    ball.x = W / 2;
    ball.y = H / 2;
    ball.speed = 5;
    ball.velX = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.velY = (Math.random() * 4 - 2);
    ball.radius = BALL_RADIUS;
  }

  function collisionDetect(paddleX, paddleY) {
    const ball = ballRef.current;
    return (
      ball.x - ball.radius < paddleX + PADDLE_WIDTH &&
      ball.x + ball.radius > paddleX &&
      ball.y + ball.radius > paddleY &&
      ball.y - ball.radius < paddleY + PADDLE_HEIGHT
    );
  }

  function step() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = widthRef.current;
    const H = heightRef.current;

    const ball = ballRef.current;
    let playerY = playerYRef.current;
    let aiY = aiYRef.current;

    // --- INPUT ---
    const speed = 6;
    if (inputState.up) playerY -= speed;
    if (inputState.down) playerY += speed;

    // mouse priority on desktop (αν κινείται)
    if (!isTouch && lastMouseYRef.current !== null) {
      playerY = lastMouseYRef.current - PADDLE_HEIGHT / 2;
    }

    // clamp
    playerY = Math.max(0, Math.min(H - PADDLE_HEIGHT, playerY));

    // --- BALL PHYSICS ---
    ball.x += ball.velX;
    ball.y += ball.velY;

    // walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > H) {
      ball.velY = -ball.velY;
    }

    // paddle collisions
    if (collisionDetect(PLAYER_X, playerY)) {
      ball.velX = Math.abs(ball.velX); // προς τα δεξιά
      const collide = (ball.y - (playerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
      ball.velY = ball.speed * collide;
    }

    const AI_X = W - PADDLE_WIDTH - 10;
    if (collisionDetect(AI_X, aiY)) {
      ball.velX = -Math.abs(ball.velX); // προς τα αριστερά
      const collide = (ball.y - (aiY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
      ball.velY = ball.speed * collide;
    }

    // score (out of bounds)
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > W) {
      resetBall();
    }

    // --- AI simple follow ---
    const aiCenter = aiY + PADDLE_HEIGHT / 2;
    if (ball.y < aiCenter - 10) aiY -= 4;
    else if (ball.y > aiCenter + 10) aiY += 4;
    aiY = Math.max(0, Math.min(H - PADDLE_HEIGHT, aiY));

    // --- DRAW ---
    // background
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    // net
    ctx.fillStyle = "#fff";
    for (let i = 0; i < H; i += 20) ctx.fillRect(W / 2 - 1, i, 2, 10);

    // paddles
    ctx.fillStyle = "#fff";
    ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(W - PADDLE_WIDTH - 10, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "#fff";
    ctx.fill();

    // persist state
    playerYRef.current = playerY;
    aiYRef.current = aiY;

    rafRef.current = requestAnimationFrame(step);
  }

  // Game loop lifecycle
  useEffect(() => {
    // αρχικοποίηση
    resetBall();
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Touch move (drag on canvas) — έξτρα για κινητό
  useEffect(() => {
    if (!isTouch) return;
    const canvas = canvasRef.current;

    const onTouchMove = (e) => {
      if (!e.touches || !e.touches[0]) return;
      const rect = canvas.getBoundingClientRect();
      const y = e.touches[0].clientY - rect.top - PADDLE_HEIGHT / 2;
      playerYRef.current = Math.max(0, Math.min(heightRef.current - PADDLE_HEIGHT, y));
    };

    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => canvas.removeEventListener("touchmove", onTouchMove);
  }, [isTouch]);

  return (
    <div className="game-panel" style={{ width: "100%", height: "100%", position: "relative" }}>
      <div className="game-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <strong>{title}</strong>
        {onExit && <button className="btn" onClick={onExit}>Exit</button>}
      </div>
      {/* Αν περάσεις externalSwipeHandlers από Modal, μπορείς να το βάλεις εδώ ως overlay */}
      <canvas ref={canvasRef} style={{ width: "100%", height: "calc(100% - 40px)", borderRadius: 8, border: "1px solid rgba(255,255,255,.15)" }} />
    </div>
  );
}
