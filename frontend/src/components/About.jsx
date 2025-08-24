import React from "react"

export default function AboutSection(){
  return (
    <section id="about" className="section">
      <div className="container">
        <div className="about-content">
          <div className="about-header">
            <h2>Discover Arcade Vault</h2>
            <p>A modern 3D coverflow arcade built with React + Django</p>
          </div>

          <div className="about-main">
            <div className="about-visual">
              <div className="showcase-display">
                <div className="showcase-main">
                  <div className="corner-decoration top-left"></div>
                  <div className="corner-decoration bottom-right"></div>
                  <div className="showcase-logo" style={{display:'grid',placeItems:'center',marginBottom:10}}>
                    {/* simple logo */}
                    <svg viewBox="0 0 100 100" width="72" height="72">
                      <rect x="10" y="25" width="15" height="50" fill="#fff" opacity="0.9" transform="rotate(-15 17.5 50)"/>
                      <rect x="35" y="15" width="15" height="70" fill="#fff"/>
                      <rect x="60" y="25" width="15" height="50" fill="#fff" opacity="0.9" transform="rotate(15 67.5 50)"/>
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#fff" strokeWidth="2" opacity="0.3"/>
                    </svg>
                  </div>
                  <h3 className="showcase-title">3D Coverflow</h3>
                  <p className="showcase-subtitle">Transform your game library into an immersive experience</p>
                  <div className="showcase-badges">
                    <a className="badge" href="https://vitejs.dev/" target="_blank" rel="noreferrer">Vite</a>
                    <a className="badge" href="https://react.dev/" target="_blank" rel="noreferrer">React</a>
                    <a className="badge" href="https://swiperjs.com/" target="_blank" rel="noreferrer">Swiper</a>
                    <a className="badge" href="https://www.djangoproject.com/" target="_blank" rel="noreferrer">Django API</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-info">
              <h3>Elevate Your Arcade</h3>
              <p>Use legal-friendly embeds (Internet Archive/Ruffle) or your own HTML5 mini‑games like PONG. Add users, highscores, and more with Django.</p>
              <ul className="feature-list">
                <li>3D coverflow with smooth navigation</li>
                <li>Touch & keyboard support</li>
                <li>Autoplay & reflections (template vibe)</li>
                <li>Clean, responsive layout</li>
              </ul>
              <a href="#contact" className="cta-button">
                Start Your Project
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{marginLeft:6}}>
                  <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="stats-section" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginTop:18}}>
            {[
              ["60fps","Smooth Performance"],
              ["100%","Responsive Design"],
              ["3D","Visual Effects"],
              ["∞","Customization"]
            ].map(([num,label])=>(
              <div key={num} className="stat-item" style={{textAlign:'center',background:'rgba(255,255,255,.06)',border:'1px solid var(--border)',borderRadius:14,padding:16}}>
                <div className="stat-number" style={{fontSize:'1.6rem',fontWeight:700}}>{num}</div>
                <div className="stat-label" style={{color:'var(--muted)'}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
