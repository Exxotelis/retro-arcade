import React from "react"
import PacmanMini from "./PacmanMini.jsx"

export function PacmanModal({ open, onClose }){
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-surface" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <strong>Pacman (Local)</strong>
            <button className="btn" onClick={onClose}>Close</button>
          </div>
        </div>
        <div className="modal-body" style={{padding:'16px 12px 24px'}}>
          <PacmanMini title="Pacman Mini" onExit={onClose} />
        </div>
      </div>
    </div>
  );
}
