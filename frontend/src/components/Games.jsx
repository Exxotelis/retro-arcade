// Games.jsx (Local-only)
import React, { useEffect, useMemo, useState } from "react"
import PongModal from "./PongModal.jsx"
import BreakoutModal from "./BreakoutModal.jsx"
import { PacmanModal } from "./PacmanModal.jsx"
import ChickenModal from "./ChickenModal.jsx";

import { Swiper, SwiperSlide } from "swiper/react"
import { EffectCoverflow, Navigation, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/navigation"
import "swiper/css/pagination"


// -- Simple slide card (thumbnail + play) --
function SlideCard({ title, subtitle, img, onPlay }){
    const src = img ? (img.startsWith("/") ? asset(img) : img) : asset("images/placeholder.jpg");
  return (
    <div className="slide-card">
      <img src={img || "/images/3.jpg"} alt={title} />
      <div className="slide-meta">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
          <span className="slide-title">{title}</span>
          {subtitle && <span className="slide-sub">{subtitle}</span>}
        </div>
        <button className="play-btn" onClick={onPlay}>▶ Play</button>
      </div>
    </div>
  )
}

export default function Games(){
  // Local modal states
  const [showPong, setShowPong] = useState(false)
  const [showBreakout, setShowBreakout] = useState(false)
  const [showPacman, setShowPacman] = useState(false)
  const [showChicken, setShowChicken] = useState(false)

  // Page title based on selected slide
  const [activeTitle, setActiveTitle] = useState("Browse the Arcade")



  // Lock body scroll when any modal is open
    useEffect(()=>{
    const anyOpen = showPong || showBreakout || showPacman || showChicken; // ✅ πρόσθεσε showChicken
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return ()=>{ document.body.style.overflow = "" }
    }, [showPong, showBreakout, showPacman, showChicken]);

  // Local slides only
    const slides = useMemo(() => [
    { type:"local-pong",     title:"PONG (Local)",       subtitle:"HTML5/Canvas",  img: asset("images/pong.jpg") },
    { type:"local-breakout", title:"Breakout (Local)",   subtitle:"React/Canvas",  img: asset("images/breakout.jpg") },
    { type:"local-pacman",   title:"Pacman (Local)",     subtitle:"React/Canvas",  img: asset("images/pacman.jpg") },
    { type:"local-chicken",  title:"Chicken Run (Local)",subtitle:"React/Canvas",  img: asset("images/chicken.jpg") },
    ], []);

  return (
    <section id="home" className="section section--tight fullbleed">
      <div className="fullbleed-pad">
        <div style={{textAlign:'center',marginBottom:10}}>
          <h2 style={{margin:'0 0 6px'}}>{activeTitle}</h2>
          <p style={{color:'var(--muted)',margin:0}}>3D coverflow of our local mini‑games</p>
        </div>

        <Swiper
          modules={[EffectCoverflow, Navigation, Pagination]}
          effect="coverflow"
          grabCursor
          centeredSlides
          slidesPerView="auto"
          loop
          loopAdditionalSlides={3}
          coverflowEffect={{ rotate:0, stretch:0, depth:180, modifier:1.2, slideShadows:false }}
          navigation
          pagination={{ clickable:true }}
          style={{padding:'30px 0 60px'}}
          onSlideChange={(swiper)=>{
            const idx = swiper.realIndex
            setActiveTitle(slides[idx]?.title || "Browse the Arcade")
          }}
        >
          {slides.map((item, idx) => (
            <SwiperSlide key={idx} style={{ width: 280 }}>
              {item.type === 'local-pong' && (
                <SlideCard {...item} onPlay={()=>setShowPong(true)} />
              )}
              {item.type === 'local-breakout' && (
                <SlideCard {...item} onPlay={()=>setShowBreakout(true)} />
              )}
              {item.type === 'local-pacman' && (
                <SlideCard {...item} onPlay={()=>setShowPacman(true)} />
              )}
              {item.type === 'local-chicken' && (
                <SlideCard {...item} onPlay={()=>setShowChicken(true)} />
                )}
               

            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Local Pong modal */}
      <PongModal
        open={showPong}
        onClose={()=>{
          setShowPong(false)
          setTimeout(()=>{
            document.getElementById('home')?.scrollIntoView({behavior:'smooth'})
            window.location.hash = '#home'
          }, 0)
        }}
      />

      {/* Local Breakout modal */}
      <BreakoutModal
        open={showBreakout}
        onClose={()=>{
          setShowBreakout(false)
          setTimeout(()=>{
            document.getElementById('home')?.scrollIntoView({behavior:'smooth'})
            window.location.hash = '#home'
          }, 0)
        }}
      />

      {/* Local Pacman modal */}
      <PacmanModal
        open={showPacman}
        onClose={()=>{
          setShowPacman(false)
          setTimeout(()=>{
            document.getElementById('home')?.scrollIntoView({behavior:'smooth'})
            window.location.hash = '#home'
          }, 0)
        }}
      />
      <ChickenModal
        open={showChicken}
        onClose={()=>{
            setShowChicken(false)
            setTimeout(()=>{
            document.getElementById('home')?.scrollIntoView({behavior:'smooth'})
            window.location.hash = '#home'
            }, 0)
        }}
        />
    </section>
  )
}
