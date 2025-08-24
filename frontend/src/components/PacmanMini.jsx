// NOTE: Copy-paste into two files in your project:
// 1) PacmanMini.jsx  (the game component below)
// 2) PacmanModal.jsx (the modal wrapper at the end)
// Then import { default as PacmanMini } from "./PacmanMini.jsx" and PacmanModal from "./PacmanModal.jsx"

import React, { useEffect, useMemo, useRef, useState } from "react";

/*************************
 * PACMAN MINI (React/Canvas)
 * - Arrow keys / WASD to move
 * - Space to pause
 * - M to mute
 * - R to restart
 * - Lives, score, pellets, power pellets
 * - Simple ghost AI (scatter + chase mix)
 *************************/

const TILE = 24;             // base tile size (logical); canvas scales to container
const SPEED = 4.0;           // pac speed (tiles/sec)
const GHOST_SPEED = 3.6;     // ghost speed (tiles/sec)
const FRUIT_SCORE = 100;
const POWER_TIME = 6000;     // ms ghosts are frightened

// 0 empty, 1 wall, 2 pellet, 3 power pellet, 9 player start, 8 ghost start
// map width must be consistent per row
const LEVEL = [
  "1111111111111111111111111",
  "1........1111111........1",
  "1.11111.1111111.11111..11",
  "1.3...1.2.....2.1...3..11",
  "1.111.1.111.111.1.111..11",
  "1.....2...9.8...2.....3.1",
  "11111.1111...1111.1111..1",
  "1000..1...222...1..0000.1",
  "11111.1.1111111.1.1111..1",
  "1.....1..2...2..1.....3.1",
  "1.11111.111.111.11111..11",
  "1.3...................3.1",
  "1111111111111111111111111",
].map(r => r.replace(/0/g, "1")); // 0 treated as wall for shaping

function parseLevel(rows){
  const grid = rows.map(r => r.split("").map(ch => {
    if (ch === "1") return 1;
    if (ch === ".") return 2;
    if (ch === "3") return 3;
    if (ch === "9") return 0; // player spawn kept separately
    if (ch === "8") return 0; // ghost spawn
    return 0;
  }));
  const spawns = { player: null, ghosts: [] };
  rows.forEach((r,y)=>{
    r.split("").forEach((ch,x)=>{
      if (ch === "9") spawns.player = {x,y};
      if (ch === "8") spawns.ghosts.push({x,y});
    })
  });
  const pellets = grid.flat().filter(v=>v===2).length;
  const powers  = grid.flat().filter(v=>v===3).length;
  return { grid, spawns, pellets, powers, w: grid[0].length, h: grid.length };
}

function useAnimationFrame(callback, running){
  const req = useRef(); const last = useRef(performance.now());
  useEffect(()=>{
    function tick(now){
      const dt = Math.min(50, now - last.current); last.current = now;
      callback(dt/1000);
      req.current = requestAnimationFrame(tick);
    }
    if (running) req.current = requestAnimationFrame(tick);
    return ()=> cancelAnimationFrame(req.current);
  },[callback,running]);
}

function isWall(grid, x, y){
  return grid[y]?.[x] === 1;
}

function neighbors4(x,y){
  return [ [x+1,y], [x-1,y], [x,y+1], [x,y-1] ];
}

export default function PacmanMini({ title = "Pacman Mini", onExit }){
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  const level = useMemo(()=>parseLevel(LEVEL),[]);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [paused, setPaused] = useState(true);
  const [running, setRunning] = useState(false);
  const [muted, setMuted] = useState(false);
  const [powerUntil, setPowerUntil] = useState(0);

  const state = useRef({
    grid: level.grid.map(r=>r.slice()),
    pac: { x: level.spawns.player.x, y: level.spawns.player.y, fx: 0.5, fy: 0.5, dir: {x:1,y:0}, pending:{x:0,y:0} },
    ghosts: level.spawns.ghosts.map((s,i)=>({ x:s.x, y:s.y, fx:0.5, fy:0.5, dir:{x: i%2? -1:1, y:0}, mode:'scatter' })),
    pelletsLeft: level.pellets + level.powers,
  });

  // audio
  useEffect(()=>{ audioRef.current = new (window.AudioContext||window.webkitAudioContext)(); return ()=> audioRef.current?.close(); },[]);
  function blip(freq=440, dur=0.06){ if(muted) return; const ctx=audioRef.current; if(!ctx) return; const o=ctx.createOscillator(), g=ctx.createGain(); o.type='square'; o.frequency.value=freq; g.gain.value=0.05; o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+dur); }

  // resize
  useEffect(()=>{
    function resize(){
      const wrap = wrapRef.current; const cv = canvasRef.current; if(!wrap||!cv) return;
      const W = level.w * TILE, H = level.h * TILE;
      const ww = wrap.clientWidth; const aspect = W/H; const w = ww; const h = Math.round(w/aspect);
      cv.width = W; cv.height = H; cv.style.width = w+'px'; cv.style.height = h+'px';
    }
    resize(); const ro = new ResizeObserver(resize); wrapRef.current && ro.observe(wrapRef.current); return ()=>ro.disconnect();
  },[level.w, level.h]);

  // input
  useEffect(()=>{
    const onKey = (e,down)=>{
      if(!down) return;
      const map = { ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0], w:[0,-1], s:[0,1], a:[-1,0], d:[1,0], W:[0,-1], S:[0,1], A:[-1,0], D:[1,0] };
      if (map[e.key]){ const [dx,dy]=map[e.key]; state.current.pac.pending = {x:dx,y:dy}; e.preventDefault(); setRunning(true); setPaused(false); }
      if (e.code==='Space'){ setPaused(p=>!p); setRunning(true); }
      if (e.key==='m'||e.key==='M') setMuted(m=>!m);
      if (e.key==='r'||e.key==='R') restart();
    };
    window.addEventListener('keydown', e=>onKey(e,true));
    return ()=> window.removeEventListener('keydown', e=>onKey(e,true));
  },[]);

  function restart(){
    state.current.grid = level.grid.map(r=>r.slice());
    state.current.pac = { x: level.spawns.player.x, y: level.spawns.player.y, fx:0.5, fy:0.5, dir:{x:1,y:0}, pending:{x:0,y:0} };
    state.current.ghosts = level.spawns.ghosts.map((s,i)=>({ x:s.x, y:s.y, fx:0.5, fy:0.5, dir:{x: i%2? -1:1, y:0}, mode:'scatter' }));
    state.current.pelletsLeft = level.pellets + level.powers;
    setScore(0); setLives(3); setPowerUntil(0); setPaused(true); setRunning(false);
  }

  // movement helpers
  function canEnter(grid, x, y){ return !isWall(grid,x,y); }
  function stepEntity(ent, speedTilesPerSec, dt){
    // try pending direction if aligned to cell center
    if (Math.abs(ent.fx-0.5)<0.02 && Math.abs(ent.fy-0.5)<0.02 && ent.pending){
      const nx = ent.x + ent.pending.x, ny = ent.y + ent.pending.y;
      if (canEnter(state.current.grid, nx, ny)) ent.dir = {...ent.pending};
    }
    const nx = ent.x + ent.dir.x, ny = ent.y + ent.dir.y;
    // move within tile
    ent.fx += ent.dir.x * speedTilesPerSec * dt;
    ent.fy += ent.dir.y * speedTilesPerSec * dt;
    // handle crossing to next cell
    while (ent.fx < 0 || ent.fx > 1 || ent.fy < 0 || ent.fy > 1){
      if (ent.fx < 0) { ent.fx += 1; ent.x -= 1; }
      if (ent.fx > 1) { ent.fx -= 1; ent.x += 1; }
      if (ent.fy < 0) { ent.fy += 1; ent.y -= 1; }
      if (ent.fy > 1) { ent.fy -= 1; ent.y += 1; }
      // wall collision -> snap back & stop
      if (isWall(state.current.grid, ent.x + Math.sign(ent.dir.x), ent.y + Math.sign(ent.dir.y)) && (ent.fx<0.5||ent.fx>0.5||ent.fy<0.5||ent.fy>0.5)){
        ent.fx = 0.5; ent.fy = 0.5; ent.dir = {x:0,y:0}; break;
      }
    }
  }

  // simple ghost AI: at intersections choose direction that roughly reduces distance to pacman, with some randomness
  function ghostThink(dt){
    const { pac, ghosts, grid } = state.current;
    ghosts.forEach((g,i)=>{
      // if near center of tile, pick a new direction not blocked
      if (Math.abs(g.fx-0.5)<0.05 && Math.abs(g.fy-0.5)<0.05){
        const opts = neighbors4(g.x,g.y).filter(([x,y])=>!isWall(grid,x,y));
        // avoid reversing unless no choice
        const rev = {x:-g.dir.x, y:-g.dir.y};
        const candidates = opts.map(([x,y])=>({ x:x-g.x, y:y-g.y })).filter(d=>!(d.x===rev.x && d.y===rev.y));
        const dirs = candidates.length? candidates : opts.map(([x,y])=>({x:x-g.x,y:y-g.y}));
        // mode
        const frightened = Date.now() < powerUntil;
        const target = { x: pac.x + pac.fx, y: pac.y + pac.fy };
        dirs.sort((a,b)=>{
          const da = Math.hypot((g.x+a.x)-target.x, (g.y+a.y)-target.y);
          const db = Math.hypot((g.x+b.x)-target.x, (g.y+b.y)-target.y);
          return frightened ? db - da : da - db; // if frightened, go away
        });
        const pick = Math.random()<0.2 && dirs[1]? dirs[1] : dirs[0];
        if (pick) g.dir = pick;
      }
      stepEntity(g, (Date.now()<powerUntil? GHOST_SPEED*0.6 : GHOST_SPEED), dt);
    });
  }

  useAnimationFrame((dt)=>{
    if (!running || paused) return draw();
    const st = state.current;

    // move pac
    stepEntity(st.pac, SPEED, dt);

    // eating pellets
    const cx = st.pac.x, cy = st.pac.y;
    const cell = st.grid[cy]?.[cx];
    if (cell === 2 && Math.hypot(st.pac.fx-0.5, st.pac.fy-0.5) < 0.35){ st.grid[cy][cx]=0; st.pelletsLeft--; setScore(s=>s+10); blip(740); }
    if (cell === 3 && Math.hypot(st.pac.fx-0.5, st.pac.fy-0.5) < 0.35){ st.grid[cy][cx]=0; st.pelletsLeft--; setScore(s=>s+50); blip(520); setPowerUntil(Date.now()+POWER_TIME); }

    // ghosts think & move
    ghostThink(dt);

    // collisions with ghosts
    const frightened = Date.now() < powerUntil;
    for (const g of st.ghosts){
      const dx = (g.x+g.fx) - (st.pac.x+st.pac.fx);
      const dy = (g.y+g.fy) - (st.pac.y+st.pac.fy);
      if (Math.hypot(dx,dy) < 0.7){
        if (frightened){ setScore(s=>s+200); blip(300); // send ghost home
          g.x = level.spawns.ghosts[0].x; g.y = level.spawns.ghosts[0].y; g.fx=0.5; g.fy=0.5; g.dir={x:1,y:0};
        } else {
          // lose life
          setLives(v=>v-1); blip(180);
          // reset positions
          st.pac = { x: level.spawns.player.x, y: level.spawns.player.y, fx:0.5, fy:0.5, dir:{x:1,y:0}, pending:{x:0,y:0} };
          st.ghosts = level.spawns.ghosts.map((s,i)=>({ x:s.x, y:s.y, fx:0.5, fy:0.5, dir:{x: i%2? -1:1, y:0}, mode:'scatter' }));
          setPaused(true);
          break;
        }
      }
    }

    // win condition
    if (st.pelletsLeft <= 0){
      setPaused(true); setRunning(false); blip(900);
    }

    draw();
  }, true);

  function draw(){
    const cv = canvasRef.current; if(!cv) return; const ctx = cv.getContext('2d');
    const W = level.w*TILE, H = level.h*TILE;
    // bg
    const grd = ctx.createLinearGradient(0,0,0,H); grd.addColorStop(0,'#0a0f1f'); grd.addColorStop(1,'#101833');
    ctx.fillStyle = grd; ctx.fillRect(0,0,W,H);

    // draw map
    for (let y=0;y<level.h;y++){
      for (let x=0;x<level.w;x++){
        const v = state.current.grid[y][x];
        if (isWall(state.current.grid,x,y)){
          ctx.fillStyle = '#1e2b5a';
          ctx.fillRect(x*TILE, y*TILE, TILE, TILE);
          ctx.strokeStyle = '#0c1330'; ctx.lineWidth = 2; ctx.strokeRect(x*TILE+1, y*TILE+1, TILE-2, TILE-2);
        } else if (v===2){ // pellet
          ctx.fillStyle = '#ffd166';
          ctx.beginPath(); ctx.arc(x*TILE+TILE/2, y*TILE+TILE/2, 3, 0, Math.PI*2); ctx.fill();
        } else if (v===3){ // power pellet
          ctx.fillStyle = '#ff6ad5';
          ctx.beginPath(); ctx.arc(x*TILE+TILE/2, y*TILE+TILE/2, 6, 0, Math.PI*2); ctx.fill();
        }
      }
    }

    // header
    ctx.fillStyle = '#fff'; ctx.font = '16px monospace';
    ctx.fillText(`${title}  •  Score: ${score}  •  Lives: ${lives}`, 12, 18);
    if (paused){
      ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.font='bold 32px monospace'; ctx.fillText(running? 'PAUSED' : 'Press any arrow/WASD', W/2, H/2-10);
      ctx.font='16px monospace'; ctx.fillText('Space=pause • R=restart • M=mute', W/2, H/2+24);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
    }

    // pacman
    const p = state.current.pac; const px=(p.x+p.fx)*TILE, py=(p.y+p.fy)*TILE;
    const mouth = Math.abs(Math.sin(performance.now()/120))*0.9; // chomp
    const ang = p.dir.x>0? 0 : p.dir.x<0? Math.PI : p.dir.y>0? Math.PI/2 : -Math.PI/2;
    ctx.fillStyle = '#ffe066';
    ctx.beginPath();
    ctx.moveTo(px,py);
    ctx.arc(px,py, TILE*0.45, ang+mouth*0.4, ang-mouth*0.4, false);
    ctx.closePath(); ctx.fill();

    // ghosts
    const frightened = Date.now() < powerUntil;
    state.current.ghosts.forEach((g,i)=>{
      const gx=(g.x+g.fx)*TILE, gy=(g.y+g.fy)*TILE;
      ctx.fillStyle = frightened? '#6bd3ff' : ['#ff595e','#8ac926','#ffca3a','#1982c4'][i%4];
      // body
      ctx.beginPath();
      ctx.arc(gx, gy-4, TILE*0.38, Math.PI, 0);
      ctx.lineTo(gx+TILE*0.38, gy+TILE*0.38);
      ctx.lineTo(gx-TILE*0.38, gy+TILE*0.38);
      ctx.closePath(); ctx.fill();
      // eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(gx-6, gy-6, 4, 0, Math.PI*2); ctx.arc(gx+6, gy-6, 4, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1b1b1b';
      ctx.beginPath(); ctx.arc(gx-6+(g.dir.x*2), gy-6+(g.dir.y*2), 2, 0, Math.PI*2); ctx.arc(gx+6+(g.dir.x*2), gy-6+(g.dir.y*2), 2, 0, Math.PI*2); ctx.fill();
    });
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
      <p className="text-sm opacity-70 mt-2">Controls: Arrow keys / WASD • Space=pause • M=mute • R=restart</p>
    </div>
  );
}
