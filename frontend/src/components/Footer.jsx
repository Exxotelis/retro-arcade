import React from "react"

export default function Footer(){
  return (
    <footer className="footer">
      <div className="container footer-wrap">
        <div>© 2025 Arcade Vault. All rights reserved.</div>
        <div style={{display:'flex',gap:18,alignItems:'center'}}>
          <a href="#privacy" onClick={(e)=>{e.preventDefault(); alert('Privacy Policy...')}}>Privacy</a>
          <a href="#terms" onClick={(e)=>{e.preventDefault(); alert('Terms of Service...')}}>Terms</a>
        </div>
      </div>
    </footer>
  )
}
