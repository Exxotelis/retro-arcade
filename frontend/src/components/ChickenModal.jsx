// === ChickenModal.jsx ===
import React from "react";
import ChickenMini from "./ChickenMini.jsx";

export default function ChickenModal({ open, onClose }){
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-surface" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <strong>Chicken Run (Local)</strong>
            <button className="btn" onClick={onClose}>Close</button>
          </div>
        </div>
        <div className="modal-body" style={{padding:'16px 12px 24px'}}>
          <ChickenMini title="Chicken Run" onExit={onClose} />
        </div>
      </div>
    </div>
  );
}
