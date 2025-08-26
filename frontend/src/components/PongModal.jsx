import React, { useEffect, useRef } from "react"

export default function PongModal({ open, onClose }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const canvas = document.createElement("canvas")
    canvas.id = "pong"
    canvas.style.width = "100%"
    canvas.style.height = "100%"

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = containerRef.current.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      const ctx = canvas.getContext("2d")
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    containerRef.current.innerHTML = ""
    containerRef.current.appendChild(canvas)

    // φορτώνουμε το script από το σωστό base
    const s = document.createElement("script")
    const base = import.meta.env.BASE_URL || "/"
    s.src = `${base}pong.js`
    s.async = true
    containerRef.current.appendChild(s)

    return () => {
      window.removeEventListener("resize", resize)
      if (containerRef.current) containerRef.current.innerHTML = ""
    }
  }, [open])

  if (!open) return null

  const closeAndGoHome = () => {
    onClose?.()
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
