// === ChickenMini.jsx (image-sprite version) ===
// Place a PNG at /public/images/chicken.png (facing RIGHT). Size ~128x128 with transparent bg.
// Optional props: chickenImgSrc (override path), title, onExit

import React, { useEffect, useMemo, useRef, useState } from "react";

const GRID = { cols: 13, rows: 15, tile: 36 };
const LANES = [
  "grass",
  "road", "road", "grass",
  "road", "road", "grass",
  "road", "grass", "road",
  "grass", "road", "grass",
  "start",
];

const CFG = {
  lives: 3,
  baseSpeed: 2.2, // tiles/sec
  seedScore: 25,
  finishScore: 100,
};

function useAnimationFrame(callback, running){
  const req = useRef(); const last = useRef(performance.now());
  useEffect(()=>{
    function tick(now){ const dt = Math.min(50, now - last.current); last.current = now; callback(dt/1000); req.current = requestAnimationFrame(tick); }
    if (running) req.current = requestAnimationFrame(tick);
    return ()=> cancelAnimationFrame(req.current);
  },[callback,running]);
}

function rand(min,max){ return Math.random()*(max-min)+min }
function dirToAngle(dir){
  if (dir.x>0) return 0;            // right
  if (dir.x<0) return Math.PI;      // left
  if (dir.y>0) return Math.PI/2;    // down
  if (dir.y<0) return -Math.PI/2;   // up
  return 0;
}

export default function ChickenMini({ title = "Chicken Run", onExit, chickenImgSrc = "/images/chicken.png" }){
  const wrapRef = useRef(null); const canvasRef = useRef(null);
  const audioRef = useRef(null);

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(CFG.lives);
  const [paused, setPaused] = useState(true);
  const [running, setRunning] = useState(false);
  const [muted, setMuted] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const chickenImgRef = useRef(null);

  const state = useRef({
    chicken: { x: Math.floor(GRID.cols/2), y: GRID.rows-1, fx:0.5, fy:0.5, dir:{x:0,y:-1} },
    cars: [],
    seeds: new Set(), // key: `${x},${y}`
  });

  // load image once
  useEffect(()=>{
    const img = new Image();
    img.onload = ()=>{ chickenImgRef.current = img; setImgLoaded(true); };
    img.onerror = ()=>{ setImgLoaded(false); };
    img.src = chickenImgSrc;
  },[chickenImgSrc]);

  // audio (simple beeps)
  useEffect(()=>{ audioRef.current = new (window.AudioContext||window.webkitAudioContext)(); return ()=>audioRef.current?.close(); },[]);
  function blip(f=500,d=0.06){ if(muted) return; const ctx=audioRef.current; if(!ctx) return; const o=ctx.createOscillator(); const g=ctx.createGain(); o.type='square'; o.frequency.value=f; g.gain.value=0.05; o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+d); }

  // responsive canvas
  useEffect(()=>{
    function resize(){ const wrap=wrapRef.current, cv=canvasRef.current; if(!wrap||!cv) return; const W=GRID.cols*GRID.tile, H=GRID.rows*GRID.tile; const ww=wrap.clientWidth; const aspect=W/H; const w=ww; const h=Math.round(w/aspect); cv.width=W; cv.height=H; cv.style.width=w+'px'; cv.style.height=h+'px'; }
    resize(); const ro=new ResizeObserver(resize); wrapRef.current && ro.observe(wrapRef.current); return ()=>ro.disconnect();
  },[]);

  // init level
  useEffect(()=>{ buildLevel(); resetChicken(); setPaused(true); setRunning(false); },[level]);

  function resetChicken(){ state.current.chicken = { x: Math.floor(GRID.cols/2), y: GRID.rows-1, fx:0.5, fy:0.5, dir:{x:0,y:-1} }; }

  function buildLevel(){
    const cars=[]; const seeds=new Set();
    for (let r=0;r<GRID.rows;r++){
      const laneType = LANES[LANES.length-1-r] || (r===0? 'grass' : 'road');
      if (laneType==='road'){
        const dir = Math.random()>0.5? 1 : -1;
        const carCount = 1 + Math.floor(rand(1,3));
        for (let i=0;i<carCount;i++){
          cars.push({ row:r, x: rand(0, GRID.cols-1), w: rand(0.9,1.8), speed: (CFG.baseSpeed + (level-1)*0.35) * (0.8+Math.random()*0.6), dir });
        }
      }
      if ((laneType==='grass') && r!==GRID.rows-1){ if (Math.random()<0.45){ const x=Math.floor(rand(0,GRID.cols)); seeds.add(`${x},${r}`); } }
    }
    state.current.cars = cars; state.current.seeds = seeds;
  }

  // input (grid-step movement)
  useEffect(()=>{
    const onKey = (e)=>{
      const key=e.key; let dx=0,dy=0; if(['ArrowUp','w','W'].includes(key)) dy=-1; if(['ArrowDown','s','S'].includes(key)) dy=1; if(['ArrowLeft','a','A'].includes(key)) dx=-1; if(['ArrowRight','d','D'].includes(key)) dx=1;
      if (dx||dy){ moveChicken(dx,dy); e.preventDefault(); setRunning(true); setPaused(false); }
      if (e.code==='Space'){ setPaused(p=>!p); setRunning(true); }
      if (key==='m'||key==='M') setMuted(m=>!m);
      if (key==='r'||key==='R') restart();
    };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[]);

  function restart(){ setScore(0); setLives(CFG.lives); setLevel(1); buildLevel(); resetChicken(); setPaused(true); setRunning(false); }

  function moveChicken(dx,dy){
    const ch = state.current.chicken; const nx = Math.max(0, Math.min(GRID.cols-1, ch.x+dx)); const ny = Math.max(0, Math.min(GRID.rows-1, ch.y+dy));
    ch.x = nx; ch.y = ny; ch.fx=0.5; ch.fy=0.5; ch.dir = {x:Math.sign(dx), y:Math.sign(dy)}; blip(720,0.04);
    // seed pickup
    const k=`${nx},${ny}`; if (state.current.seeds.has(k)){ state.current.seeds.delete(k); setScore(s=>s+CFG.seedScore); blip(900,0.06); }
    // reached top
    if (ny===0){ setScore(s=>s+CFG.finishScore); setLevel(l=>l+1); blip(980,0.1); }
  }

  // game loop: move cars & collisions
  useAnimationFrame((dt)=>{
    if (!running || paused) return draw();
    const st = state.current;

    // move cars
    for (const c of st.cars){ c.x += c.dir * c.speed * dt; if (c.dir>0 && c.x > GRID.cols+2) c.x = -2; if (c.dir<0 && c.x < -3) c.x = GRID.cols+2; }

    // collisions
    const ch = st.chicken; // treat chicken as small box
    for (const c of st.cars){ if (Math.round(c.row)===ch.y){ const cx=c.x, cw=c.w; if (ch.x+0.4 > cx && ch.x-0.4 < cx+cw){
          // hit
          setLives(prev => { const remaining = prev - 1; if (remaining <= 0) { setPaused(true); setRunning(false); } return remaining; });
          blip(180,0.08);
          resetChicken(); setPaused(true);
          break;
    } } }

    draw();
  }, true);

  function draw(){
    const cv=canvasRef.current; if(!cv) return; const ctx=cv.getContext('2d');
    const W=GRID.cols*GRID.tile, H=GRID.rows*GRID.tile; ctx.clearRect(0,0,W,H);

    // bg lanes
    for (let r=0;r<GRID.rows;r++){
      const laneType = LANES[LANES.length-1-r] || (r===0? 'grass' : 'road');
      if (laneType==='grass' || laneType==='start') ctx.fillStyle = r%2? '#1e3a2a' : '#20452f';
      else if (laneType==='road') ctx.fillStyle = r%2? '#2b2b2b' : '#202020';
      else ctx.fillStyle = '#203648';
      ctx.fillRect(0, r*GRID.tile, W, GRID.tile);

      if (laneType==='road'){
        ctx.strokeStyle = '#5a5a5a'; ctx.lineWidth = 2; ctx.setLineDash([10,10]);
        ctx.beginPath(); ctx.moveTo(0, r*GRID.tile + GRID.tile/2); ctx.lineTo(W, r*GRID.tile + GRID.tile/2); ctx.stroke(); ctx.setLineDash([]);
      }
    }

    // header
    ctx.fillStyle = '#fff'; ctx.font = '16px monospace';
    ctx.fillText(`${title} • Score: ${score} • Lives: ${lives} • Level: ${level}`, 10, 20);
    if (paused){ ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font='bold 28px monospace'; ctx.fillText(running? 'PAUSED' : 'Press arrows/WASD', W/2, H/2-10); ctx.font='14px monospace'; ctx.fillText('Space=pause • R=restart • M=mute', W/2, H/2+18); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; }

    // seeds
    for (const key of state.current.seeds){ const [x,y]=key.split(',').map(Number); ctx.fillStyle='#ffd166'; ctx.beginPath(); ctx.arc((x+0.5)*GRID.tile, (y+0.5)*GRID.tile, 4, 0, Math.PI*2); ctx.fill(); }

    // cars (rects for now)
    for (const c of state.current.cars){ const x=c.x*GRID.tile, y=c.row*GRID.tile; const w=c.w*GRID.tile, h=GRID.tile*0.8; ctx.fillStyle = '#e63946'; ctx.fillRect(x, y+(GRID.tile-h)/2, w, h); ctx.fillStyle='#222'; ctx.fillRect(x+4, y+(GRID.tile-h)/2 + h-6, w-8, 6); }

    // chicken (image sprite)
    const ch=state.current.chicken; const cx=(ch.x+0.5)*GRID.tile, cy=(ch.y+0.5)*GRID.tile;
    const img = chickenImgRef.current;
    const size = GRID.tile * 0.9; // sprite size

    if (imgLoaded && img){
      ctx.save();
      const ang = dirToAngle(ch.dir);
      ctx.translate(cx, cy);
      ctx.rotate(ang);
      ctx.drawImage(img, -size/2, -size/2, size, size);
      ctx.restore();
    } else {
      // fallback vector chicken
      ctx.fillStyle = '#fff8e1'; ctx.beginPath(); ctx.arc(cx, cy, GRID.tile*0.35, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ff9f1c'; ctx.beginPath(); ctx.moveTo(cx+10, cy); ctx.lineTo(cx+2, cy-4); ctx.lineTo(cx+2, cy+4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ff595e'; ctx.beginPath(); ctx.arc(cx-6, cy-14, 5, 0, Math.PI*2); ctx.arc(cx, cy-16, 5, 0, Math.PI*2); ctx.arc(cx+6, cy-14, 5, 0, Math.PI*2); ctx.fill();
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold select-none">{title} <span className="text-xs opacity-70">(Arcade Vault)</span></h2>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded-xl bg-neutral-800 text-white hover:bg-neutral-700" onClick={()=>{ setRunning(true); setPaused(p=>!p); }}>{paused? 'Start':'Pause'}</button>
          <button className="px-3 py-1 rounded-xl bg-neutral-800 text-white hover:bg-neutral-700" onClick={()=>setMuted(m=>!m)}>{muted? 'Unmute':'Mute'}</button>
          <button className="px-3 py-1 rounded-xl bg-neutral-800 text-white hover:bg-neutral-700" onClick={restart}>Restart</button>
          {onExit && <button className="px-3 py-1 rounded-xl bg-neutral-800 text-white hover:bg-neutral-700" onClick={onExit}>Exit</button>}
        </div>
      </div>
      <div ref={wrapRef} className="w-full rounded-2xl overflow-hidden border border-neutral-800 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
        <canvas ref={canvasRef} className="block touch-none" />
      </div>
      <p className="text-sm opacity-70 mt-2">Controls: Arrows/WASD • Space=pause • M=mute • R=restart</p>
    </div>
  );
}

