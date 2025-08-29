import { useEffect, useState } from "react";
import { isTouchDevice } from "../utils/isTouchDevice";

export default function useIsTouch() {
  const [isTouch, setIsTouch] = useState(isTouchDevice());

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    // Ακούς μεταβολές στο pointer (π.χ. hybrid συσκευές)
    const m1 = window.matchMedia("(pointer: coarse)");
    const m2 = window.matchMedia("(any-pointer: coarse)");

    const handler = () => setIsTouch(isTouchDevice());
    m1.addEventListener?.("change", handler);
    m2.addEventListener?.("change", handler);

    return () => {
      m1.removeEventListener?.("change", handler);
      m2.removeEventListener?.("change", handler);
    };
  }, []);

  return isTouch;
}
