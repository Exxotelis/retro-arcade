// src/components/BreakoutModal.jsx
import React, { useEffect, useRef } from "react";
import BreakoutMini from "./BreakoutMini.jsx";

// Κοινά helpers
import useInput from "../hooks/useInput";
import MobileControls from "../components/MobileControls";
import useIsTouch from "../hooks/useIsTouch";

export default function BreakoutModal({ open, onClose }) {
  const { state, setPressed, swipeHandlers } = useInput();
  const isTouch = useIsTouch(); // αξιόπιστο touch detection
  const prevRef = useRef(state);

  // Μετατροπή input state -> synthetic keyboard events ΜΟΝΟ σε touch
  useEffect(() => {
    if (!isTouch) return; // κρίσιμο: όχι synthetic σε desktop (αποφεύγει διπλά triggers)

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
            <strong>Breakout (Local)</strong>
            <button className="btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <div
          className="modal-body"
          style={{ padding: "16px 12px 24px", position: "relative" }}
        >
          {/* Swipe joystick layer μόνο σε touch */}
          {isTouch && <div className="touch-layer" {...swipeHandlers} />}

          {/* Το ίδιο το παιχνίδι (κρατά τον keyboard χειρισμό όπως είναι) */}
          <BreakoutMini title="Breakout" onExit={onClose} />

          {/* On-screen controls μόνο σε touch */}
          <MobileControls visible={isTouch} onPress={setPressed} />
        </div>
      </div>
    </div>
  );
}
