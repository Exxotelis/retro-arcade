// Ασφαλές για SSR (δεν σπάει σε build)
export function isTouchDevice() {
  if (typeof window === "undefined") return false;

  // 1) Pointer API (το πιο αξιόπιστο)
  if (window.matchMedia) {
    try {
      // coarse = δάχτυλο (κινητό/τάμπλετ), fine = ποντίκι/pen
      if (window.matchMedia("(pointer: coarse)").matches) return true;
      if (window.matchMedia("(any-pointer: coarse)").matches) return true;
    } catch (_) {}
  }

  // 2) Touch events presence
  if ("ontouchstart" in window) return true;

  // 3) maxTouchPoints (iPadOS με mouse, hybrid devices)
  const nav = window.navigator;
  if (nav && (nav.maxTouchPoints > 0 || nav.msMaxTouchPoints > 0)) return true;

  return false;
}
