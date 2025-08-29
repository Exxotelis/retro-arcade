import React from "react";

export default function MobileControls({ visible=true, onPress }) {
  if (!visible) return null;
  const handle = (name, down) => (e) => {
    e.preventDefault();
    onPress(name, down);
  };
  return (
    <div className="mobile-hud">
      {/* D-Pad */}
      <div className="hud-left">
        <div className="dpad">
          <div />
          <button className="hud-btn" onPointerDown={handle("up", true)} onPointerUp={handle("up", false)}
                  onTouchStart={handle("up", true)} onTouchEnd={handle("up", false)}>▲</button>
          <div />
          <button className="hud-btn" onPointerDown={handle("left", true)} onPointerUp={handle("left", false)}
                  onTouchStart={handle("left", true)} onTouchEnd={handle("left", false)}>◀</button>
          <div />
          <button className="hud-btn" onPointerDown={handle("right", true)} onPointerUp={handle("right", false)}
                  onTouchStart={handle("right", true)} onTouchEnd={handle("right", false)}>▶</button>
          <div />
          <button className="hud-btn" onPointerDown={handle("down", true)} onPointerUp={handle("down", false)}
                  onTouchStart={handle("down", true)} onTouchEnd={handle("down", false)}>▼</button>
          <div />
        </div>
      </div>
      {/* A/B */}
      <div className="hud-right">
        <button className="hud-btn" onPointerDown={handle("A", true)} onPointerUp={handle("A", false)}
                onTouchStart={handle("A", true)} onTouchEnd={handle("A", false)}>A</button>
        <button className="hud-btn" onPointerDown={handle("B", true)} onPointerUp={handle("B", false)}
                onTouchStart={handle("B", true)} onTouchEnd={handle("B", false)}>B</button>
      </div>
    </div>
  );
}
