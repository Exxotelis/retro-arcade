import React, { useState } from "react"

export default function Header({ query, setQuery }) {
  const [open, setOpen] = useState(false)

  const go = (id) => (e) => {
    e.preventDefault()
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <header className="app-header">
      <div className="container app-header-inner" style={{ position: "relative" }}>
        {/* Left: Logo */}
        <a className="brand" href="#home" onClick={go('home')}>
          <span style={{ fontSize: "1.4rem" }}>🕹️</span>
          <h1>Arcade Vault</h1>
        </a>

        {/* Center: Search */}
        <div className="search" style={{ justifyContent: "center" }}>
          <input
            className="input"
            placeholder="Search games..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: "100%", maxWidth: 360 }}
          />
        </div>

        {/* Right: Nav + Burger (burger μόνο σε mobile) */}
        <div className="header-right">
          <button className="menu-toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            ☰
          </button>
          <nav className={`nav ${open ? "nav--open" : ""}`}>
            <a href="#home" onClick={go('home')}>Home</a>
            <a href="#about" onClick={go('about')}>About</a>
            <a href="#contact" onClick={go('contact')}>Contact</a>
          </nav>
        </div>
      </div>
    </header>
  )
}
