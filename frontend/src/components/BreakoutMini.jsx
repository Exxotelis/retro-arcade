import React, { useEffect, useRef, useState } from "react";

// Arcade Vault – Breakout Mini Game
// Drop-in React component for your Arcade Vault project
// Features: responsive canvas, keyboard & touch controls, pause, lives, levels, score, localStorage high score
// Controls: ← → (or A/D) to move | Space to start/pause | M to mute | R to restart

// --- Tuning knobs ---
const CANVAS_BASE = { w: 960, h: 540 }; // logical size; scales to fit container
const PADDLE = { width: 120, height: 16, speed: 9 };
const BALL = { radius: 8, speed: 6 };
const LIVES = 3;

function useAnimationFrame(callback, isRunning) {
  const reqRef = useRef(null);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    function tick(now) {
      const dt = Math.min(32, now - lastTimeRef.current); // clamp
      lastTimeRef.current = now;
      callback(dt / 16.6667); // normalize ~60fps
      reqRef.current = requestAnimationFrame(tick);
    }
    if (isRunning) {
      lastTimeRef.current = performance.now();
      reqRef.current = requestAnimationFrame(tick);
    }
    return () => { if (reqRef.current) cancelAnimationFrame(reqRef.current); };
  }, [callback, isRunning]);
}

export default function BreakoutMini({ title = "Breakout", onExit }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(true);
  const [muted, setMuted] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(LIVES);
  const [high, setHigh] = useState(() => Number(localStorage.getItem("av_breakout_high") || 0));

  // game state
  const stateRef = useRef({
    paddleX: CANVAS_BASE.w / 2 - PADDLE.width / 2,
    ball: { x: CANVAS_BASE.w / 2, y: CANVAS_BASE.h - 80, vx: BALL.speed * (Math.random() > 0.5 ? 1 : -1), vy: -BALL.speed },
    bricks: [],
    brickRows: 5,
    brickCols: 12,
    brickGap: 8,
    brickTop: 80,
    brickH: 24,
    keys: { left: false, right: false },
  });

  // sounds (simple oscillator)
  const audioRef = useRef(null);
  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioRef.current = ctx;
    return () => ctx.close();
  }, []);
  function blip(freq = 440, t = 0.06) {
    if (muted || !audioRef.current) return;
    const ctx = audioRef.current;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    o.type = "square";
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + t);
  }

  // layout: create bricks
  function buildLevel(lv) {
    const st = stateRef.current;
    const margin = 24;
    const cols = st.brickCols;
    const rows = st.brickRows + Math.floor((lv - 1) % 3); // slight increase
    const brickW = (CANVAS_BASE.w - margin * 2 - st.brickGap * (cols - 1)) / cols;
    const bricks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: margin + c * (brickW + st.brickGap),
          y: st.brickTop + r * (st.brickH + st.brickGap),
          w: brickW,
          h: st.brickH,
          hp: 1 + Math.floor((lv - 1) / 2),
        });
      }
    }
    st.bricks = bricks;
  }

  // init
  useEffect(() => {
    buildLevel(level);
    resetBall();
    // resize canvas to container
    function resize() {
      const wrap = wrapRef.current; const canvas = canvasRef.current;
      if (!wrap || !canvas) return;
      const { clientWidth } = wrap;
      const aspect = CANVAS_BASE.w / CANVAS_BASE.h;
      const w = clientWidth; const h = Math.round(w / aspect);
      canvas.width = CANVAS_BASE.w; canvas.height = CANVAS_BASE.h; // logical
      canvas.style.width = w + "px"; canvas.style.height = h + "px"; // css scale
    }
    resize();
    const ro = new ResizeObserver(resize); if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [level]);

  function resetBall() {
    const st = stateRef.current;
    st.ball.x = CANVAS_BASE.w / 2; st.ball.y = CANVAS_BASE.h - 80;
    const speed = BALL.speed + (level - 1) * 0.6;
    st.ball.vx = speed * (Math.random() > 0.5 ? 1 : -1);
    st.ball.vy = -speed;
  }

  // input
  useEffect(() => {
    const onKey = (e, down) => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) { stateRef.current.keys.left = down; e.preventDefault(); }
      if (["ArrowRight", "d", "D"].includes(e.key)) { stateRef.current.keys.right = down; e.preventDefault(); }
      if (down && e.code === "Space") { setPaused(p => !p); setRunning(true); }
      if (down && (e.key === "m" || e.key === "M")) setMuted(m => !m);
      if (down && (e.key === "r" || e.key === "R")) restart();
    };
    const kd = e => onKey(e, true); const ku = e => onKey(e, false);
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
    return () => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
  }, []);

  // touch/mouse move
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const nx = (cx / rect.width) * CANVAS_BASE.w;
      stateRef.current.paddleX = Math.max(0, Math.min(CANVAS_BASE.w - PADDLE.width, nx - PADDLE.width / 2));
    };
    canvas.addEventListener("mousemove", onMove, { passive: true });
    canvas.addEventListener("touchmove", onMove, { passive: true });
    return () => { canvas.removeEventListener("mousemove", onMove); canvas.removeEventListener("touchmove", onMove); };
  }, []);

  function restart() {
    setScore(0); setLevel(1); setLives(LIVES); setPaused(true); setRunning(false);
    buildLevel(1); resetBall();
  }

  // game loop
  useAnimationFrame((dt) => {
    if (!running || paused) return draw();
    const st = stateRef.current;

    // move paddle
    if (st.keys.left) st.paddleX -= PADDLE.speed * dt;
    if (st.keys.right) st.paddleX += PADDLE.speed * dt;
    st.paddleX = Math.max(0, Math.min(CANVAS_BASE.w - PADDLE.width, st.paddleX));

    // move ball
    st.ball.x += st.ball.vx * dt;
    st.ball.y += st.ball.vy * dt;

    // walls
    if (st.ball.x < BALL.radius) { st.ball.x = BALL.radius; st.ball.vx *= -1; blip(520); }
    if (st.ball.x > CANVAS_BASE.w - BALL.radius) { st.ball.x = CANVAS_BASE.w - BALL.radius; st.ball.vx *= -1; blip(520); }
    if (st.ball.y < BALL.radius) { st.ball.y = BALL.radius; st.ball.vy *= -1; blip(600); }

    // paddle collision
    const px = st.paddleX, py = CANVAS_BASE.h - 40;
    if (st.ball.y + BALL.radius >= py && st.ball.y + BALL.radius <= py + PADDLE.height && st.ball.x >= px && st.ball.x <= px + PADDLE.width && st.ball.vy > 0) {
      st.ball.y = py - BALL.radius; st.ball.vy *= -1; blip(700);
      // add english based on where it hits paddle
      const hit = (st.ball.x - (px + PADDLE.width / 2)) / (PADDLE.width / 2);
      st.ball.vx += hit * 2.2; // tweak
      // clamp speed
      const maxV = BALL.speed + (level - 1) * 0.8 + 4;
      const mag = Math.hypot(st.ball.vx, st.ball.vy);
      if (mag > maxV) { const s = maxV / mag; st.ball.vx *= s; st.ball.vy *= s; }
    }

    // bricks
    for (let i = st.bricks.length - 1; i >= 0; i--) {
      const b = st.bricks[i];
      if (!b) continue;
      if (
        st.ball.x + BALL.radius > b.x && st.ball.x - BALL.radius < b.x + b.w &&
        st.ball.y + BALL.radius > b.y && st.ball.y - BALL.radius < b.y + b.h
      ) {
        // determine side: reflect the axis with smaller overlap
        const overlapX = Math.min(st.ball.x + BALL.radius - b.x, b.x + b.w - (st.ball.x - BALL.radius));
        const overlapY = Math.min(st.ball.y + BALL.radius - b.y, b.y + b.h - (st.ball.y - BALL.radius));
        if (overlapX < overlapY) { st.ball.vx *= -1; } else { st.ball.vy *= -1; }
        b.hp -= 1; blip(820);
        if (b.hp <= 0) { st.bricks.splice(i, 1); setScore(s => s + 10); }
      }
    }

    // out of bounds (bottom)
    if (st.ball.y > CANVAS_BASE.h + BALL.radius) {
      const remaining = lives - 1;
      setLives(remaining);
      blip(180);
      if (remaining <= 0) {
        setPaused(true); setRunning(false);
        setHigh(h => { const nh = Math.max(h, score); localStorage.setItem("av_breakout_high", String(nh)); return nh; });
      } else {
        resetBall(); setPaused(true);
      }
    }

    // next level
    if (stateRef.current.bricks.length === 0) {
      setLevel(l => l + 1);
      buildLevel(level + 1);
      resetBall();
      setPaused(true);
      blip(960, 0.12);
    }

    draw();
  }, true);

  function draw() {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    // clear (retro scanline gradient)
    const grd = ctx.createLinearGradient(0, 0, 0, CANVAS_BASE.h);
    grd.addColorStop(0, "#0b0f1a");
    grd.addColorStop(1, "#141b2d");
    ctx.fillStyle = grd; ctx.fillRect(0, 0, CANVAS_BASE.w, CANVAS_BASE.h);

    // stars
    ctx.globalAlpha = 0.15; ctx.fillStyle = "#9ad1ff";
    for (let i = 0; i < 80; i++) ctx.fillRect(((i * 97) % CANVAS_BASE.w), ((i * 53) % CANVAS_BASE.h), 2, 2);
    ctx.globalAlpha = 1;

    // title bar
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px monospace";
    ctx.fillText(`${title}  •  Score: ${score}  •  Lives: ${lives}  •  Level: ${level}  •  High: ${high}`, 20, 28);

    // paddle
    const px = stateRef.current.paddleX, py = CANVAS_BASE.h - 40;
    ctx.fillStyle = "#00e5ff"; // no theming; simple neon
    ctx.fillRect(px, py, PADDLE.width, PADDLE.height);

    // ball
    ctx.beginPath(); ctx.arc(stateRef.current.ball.x, stateRef.current.ball.y, BALL.radius, 0, Math.PI * 2); ctx.closePath();
    ctx.fillStyle = "#ffd166"; ctx.fill();

    // bricks
    for (const b of stateRef.current.bricks) {
      const hp = Math.max(0, b.hp);
      ctx.fillStyle = hp > 1 ? "#ff708d" : "#9bff80";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = "#0b0f1a"; ctx.lineWidth = 2; ctx.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
    }

    if (!running || paused) {
      ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0, 0, CANVAS_BASE.w, CANVAS_BASE.h);
      ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = "bold 36px monospace"; ctx.fillText(!running ? "Press SPACE to Start" : "Paused", CANVAS_BASE.w / 2, CANVAS_BASE.h / 2 - 10);
      ctx.font = "16px monospace"; ctx.fillText("← → or A/D to move • M mute • R restart", CANVAS_BASE.w / 2, CANVAS_BASE.h / 2 + 28);
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold select-none">{title} <span className="text-xs opacity-70">(Arcade Vault)</span></h2>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded-xl bg-neutral-800 text-white hover:bg-neutral-700" onClick={() => { setRunning(true); setPaused(p => !p); }}>{paused ? "Start" : "Pause"}</button>
          <button className="px-3 py-1 rounded-xl bg-neutral-800 text-white hover:bg-neutral-700" onClick={() => setMuted(m => !m)}>{muted ? "Unmute" : "Mute"}</button>
          <button className="px-3 py-1 rounded-xl bg-neutral-800 text-white hover:bg-neutral-700" onClick={restart}>Restart</button>
          {onExit && (
            <button className="px-3 py-1 rounded-xl bg-neutral-800 text-white hover:bg-neutral-700" onClick={onExit}>Exit</button>
          )}
        </div>
      </div>
      <div ref={wrapRef} className="w-full rounded-2xl overflow-hidden border border-neutral-800 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
        <canvas ref={canvasRef} className="block touch-none" />
      </div>
      <p className="text-sm opacity-70 mt-2">Controls: ← → or A/D • Space=Start/Pause • M=Mute • R=Restart • Touch/Mouse to move paddle</p>
    </div>
  );
}
