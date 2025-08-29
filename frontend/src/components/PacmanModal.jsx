// src/components/PacmanModal.jsx
import React, { useEffect, useRef } from "react";
import PacmanMini from "./PacmanMini.jsx";

import useInput from "../hooks/useInput";
import MobileControls from "../components/MobileControls";
import useIsTouch from "../hooks/useIsTouch";

export default function PacmanModal({ open, onClose }) {
  const { state, setPressed, swipeHandlers } = useInput();
  const isTouch = useIsTouch();
  const prevRef = useRef(state);



  // Emit synthetic keyboard events ΜΟΝΟ σε touch
  useEffect(() => {
    if (!isTouch) return;

    const prev = prevRef.current;
    const now = state;

    const emit = (code, type) => {
      const ev = new KeyboardEvent(type, {
        key: code.startsWith("Arrow") ? code : (code === "Space" ? " " : code),
        code,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(ev);
    };

    const diff = (name, keyCode) => {
      if (prev[name] === now[name]) return;
      emit(keyCode, now[name] ? "keydown" : "keyup");
    };

    diff("left", "ArrowLeft");
    diff("right", "ArrowRight");
    diff("up", "ArrowUp");
    diff("down", "ArrowDown");
    diff("A", "Space");
    diff("B", "KeyX");
    diff("start", "Enter");
    diff("select", "ShiftLeft");

    prevRef.current = now;
  }, [state, isTouch]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-surface" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div
            className="container"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <strong>Pacman (Local)</strong>
            <button className="btn" onClick={onClose}>Close</button>
          </div>
        </div>

        <div className="modal-body" style={{ padding: "16px 12px 24px", position: "relative" }}>
          {/* swipe layer μόνο σε touch */}
          {isTouch && <div className="touch-layer" {...swipeHandlers} />}

          {/* game component (κρατά keyboard support) */}
          <PacmanMini title="Pacman Mini" onExit={onClose} />

          {/* on-screen controls μόνο σε touch */}
          <MobileControls visible={isTouch} onPress={setPressed} />
        </div>
      </div>
    </div>
  );
}
