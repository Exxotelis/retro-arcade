import React, { useEffect, useRef } from "react"

export default function PongModal({ open, onClose }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    // φτιάξε το canvas που περιμένει το pong.js
    const canvas = document.createElement("canvas")
    canvas.id = "pong"
    canvas.width = 640
    canvas.height = 400
    canvas.style.width = "100%"
    canvas.style.height = "auto"
    containerRef.current.innerHTML = ""
    containerRef.current.appendChild(canvas)

    // φόρτωσε το script
    const s = document.createElement("script")
    s.src = "/pong.js"
    s.async = true
    containerRef.current.appendChild(s)

    return () => {
      // cleanup
      if (containerRef.current) containerRef.current.innerHTML = ""
    }
  }, [open])

  if (!open) return null

  const closeAndGoHome = () => {
    // 1) κλείσε το modal
    onClose?.()
    // 2) redirect/scroll στο Home
    setTimeout(() => {
      const el = document.getElementById('home')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      window.location.hash = '#home'
    }, 0)
  }

  return (
    <div className="modal-backdrop" onClick={closeAndGoHome}>
      <div className="modal-surface" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="container" style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <strong>PONG (Local)</strong>
            <button className="btn" onClick={closeAndGoHome}>Close</button>
          </div>
        </div>
        <div className="modal-body">
          <div ref={containerRef} />
        </div>
      </div>
    </div>
  )
}
