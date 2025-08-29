// Games.jsx
import React, { useEffect, useMemo, useState } from "react"
import PongModal from "./PongModal.jsx"
import BreakoutModal from "./BreakoutModal.jsx"
import PacmanModal from "./PacmanModal.jsx"
import ChickenModal from "./ChickenModal.jsx"

import { Swiper, SwiperSlide } from "swiper/react"
import { EffectCoverflow, Navigation, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/navigation"
import "swiper/css/pagination"

// Import εικόνων από src/assets
import imgPong     from "../assets/images/pong.jpg"
import imgBreakout from "../assets/images/breakout.jpg"
import imgPacman   from "../assets/images/pacman.jpg"
import imgChicken  from "../assets/images/chicken.jpg"

function SlideCard({ title, subtitle, img, onPlay }) {
  const src = img; // είτε ES import είτε base+url από public/
  return (
    <div className="slide-card">
      <div className="cover">
        <img className="cover-img" src={src} alt={title} loading="lazy" />
        {/* Reflection */}
        <div className="reflection" aria-hidden="true">
          <img className="cover-img" src={src} alt="" />
          <div className="reflection-fade" />
        </div>
      </div>

      <div className="slide-meta">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
          <span className="slide-title">{title}</span>
          {subtitle && <span className="slide-sub">{subtitle}</span>}
        </div>
        <button className="play-btn" onClick={onPlay}>▶ Play</button>
      </div>
    </div>
  );
}



export default function Games(){
  const [showPong, setShowPong] = useState(false)
  const [showBreakout, setShowBreakout] = useState(false)
  const [showPacman, setShowPacman] = useState(false)
  const [showChicken, setShowChicken] = useState(false)
  const [activeTitle, setActiveTitle] = useState("Browse the Arcade")

  // Κλειδώνουμε το scroll όταν ανοίγει modal
  useEffect(()=>{
    const anyOpen = showPong || showBreakout || showPacman || showChicken
    document.body.style.overflow = anyOpen ? "hidden" : ""
    return ()=>{ document.body.style.overflow = "" }
  }, [showPong, showBreakout, showPacman, showChicken])

  // Slides
  const slides = useMemo(() => ([
    { type:"local-pong",     title:"PONG (Local)",        subtitle:"HTML5/Canvas",  img: imgPong },
    { type:"local-breakout", title:"Breakout (Local)",    subtitle:"React/Canvas",  img: imgBreakout },
    { type:"local-pacman",   title:"Pacman (Local)",      subtitle:"React/Canvas",  img: imgPacman },
    { type:"local-chicken",  title:"Chicken Run (Local)", subtitle:"React/Canvas",  img: imgChicken },
  ]), [])

  // Swiper helpers (έξω από το return, όχι μέσα στο JSX)
  const canLoop = slides.length >= 5 // με 4 slides κρατάμε loop off για να μη βγάζει warning
  const anyOpen = showPong || showBreakout || showPacman || showChicken

  return (
    <section id="home" className="section section--tight fullbleed">
      <div className="fullbleed-pad">
        <div style={{textAlign:'center',marginBottom:10}}>
          <h2 style={{margin:'0 0 6px'}}>{activeTitle}</h2>
          <p style={{color:'var(--muted)',margin:0}}>3D coverflow of our local mini-games</p>
        </div>

        <Swiper
          modules={[EffectCoverflow, Navigation, Pagination]}
          effect="coverflow"
          grabCursor
          centeredSlides
          slidesPerView={3}
          breakpoints={{
            0:    { slidesPerView: 1.2, spaceBetween: 12 },
            480:  { slidesPerView: 1.6, spaceBetween: 14 },
            768:  { slidesPerView: 2.2, spaceBetween: 16 },
            1024: { slidesPerView: 3,   spaceBetween: 20 },
          }}
          allowTouchMove={!anyOpen} // πάγωμα όταν modal ανοιχτό
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
            <SwiperSlide key={idx}>
              {item.type === 'local-pong'     && <SlideCard {...item} onPlay={()=>setShowPong(true)} />}
              {item.type === 'local-breakout' && <SlideCard {...item} onPlay={()=>setShowBreakout(true)} />}
              {item.type === 'local-pacman'   && <SlideCard {...item} onPlay={()=>setShowPacman(true)} />}
              {item.type === 'local-chicken'  && <SlideCard {...item} onPlay={()=>setShowChicken(true)} />}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Modals */}
      <PongModal open={showPong} onClose={()=>{
        setShowPong(false)
        setTimeout(()=>{ document.getElementById('home')?.scrollIntoView({behavior:'smooth'}); window.location.hash='#home' }, 0)
      }}/>

      <BreakoutModal open={showBreakout} onClose={()=>{
        setShowBreakout(false)
        setTimeout(()=>{ document.getElementById('home')?.scrollIntoView({behavior:'smooth'}); window.location.hash='#home' }, 0)
      }}/>

      <PacmanModal open={showPacman} onClose={()=>{
        setShowPacman(false)
        setTimeout(()=>{ document.getElementById('home')?.scrollIntoView({behavior:'smooth'}); window.location.hash='#home' }, 0)
      }}/>

      <ChickenModal open={showChicken} onClose={()=>{
        setShowChicken(false)
        setTimeout(()=>{ document.getElementById('home')?.scrollIntoView({behavior:'smooth'}); window.location.hash='#home' }, 0)
      }}/>
    </section>
  )
}
