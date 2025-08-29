import { useEffect, useMemo, useRef, useState } from "react";

export default function useInput() {
  const [state, setState] = useState({
    up:false, down:false, left:false, right:false,
    A:false, B:false, start:false, select:false
  });

  // Keyboard
  useEffect(() => {
    const onDown = (e) => {
      const k = e.key.toLowerCase();
      setState(s => ({
        ...s,
        up:     s.up     || (k === "arrowup"    || k === "w"),
        down:   s.down   || (k === "arrowdown"  || k === "s"),
        left:   s.left   || (k === "arrowleft"  || k === "a"),
        right:  s.right  || (k === "arrowright" || k === "d"),
        A:      s.A      || (k === " " || k === "k" || k === "z"),
        B:      s.B      || (k === "j" || k === "x"),
        start:  s.start  || (k === "enter"),
        select: s.select || (k === "shift")
      }));
    };
    const onUp = (e) => {
      const k = e.key.toLowerCase();
      setState(s => ({
        ...s,
        up:     (k === "arrowup"    || k === "w") ? false : s.up,
        down:   (k === "arrowdown"  || k === "s") ? false : s.down,
        left:   (k === "arrowleft"  || k === "a") ? false : s.left,
        right:  (k === "arrowright" || k === "d") ? false : s.right,
        A:      (k === " " || k === "k" || k === "z") ? false : s.A,
        B:      (k === "j" || k === "x") ? false : s.B,
        start:  (k === "enter") ? false : s.start,
        select: (k === "shift") ? false : s.select
      }));
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  // Touch helpers (για on-screen buttons)
  const setPressed = (name, isDown) =>
    setState(s => ({ ...s, [name]: isDown }));

  // Προαιρετικό virtual joystick (swipe σε όλη την canvas area)
  const startPos = useRef(null);
  const handlePointerDown = (e) => {
    const p = e.touches ? e.touches[0] : e;
    startPos.current = { x: p.clientX, y: p.clientY };
  };
  const handlePointerMove = (e) => {
    if (!startPos.current) return;
    const p = e.touches ? e.touches[0] : e;
    const dx = p.clientX - startPos.current.x;
    const dy = p.clientY - startPos.current.y;
    const dead = 12;
    setState(s => ({
      ...s,
      left:  dx < -dead,
      right: dx >  dead,
      up:    dy < -dead,
      down:  dy >  dead,
    }));
  };
  const handlePointerUp = () => {
    startPos.current = null;
    setState(s => ({ ...s, left:false, right:false, up:false, down:false }));
  };

  const swipeHandlers = useMemo(() => ({
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onTouchStart: handlePointerDown,
    onTouchMove: handlePointerMove,
    onTouchEnd: handlePointerUp
  }), []);

  return { state, setPressed, swipeHandlers };
}
