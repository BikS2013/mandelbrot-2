// Feature detection first (pointer capability, touch points), UA string as a
// last-resort fallback for browsers/emulators that expose neither. Layout
// follows the viewport size separately.
export const isTouchDevice =
  window.matchMedia('(pointer: coarse)').matches ||
  navigator.maxTouchPoints > 0 ||
  /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

export const isSmallScreen = window.matchMedia('(max-width: 640px)').matches;
