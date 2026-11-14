/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Checks if the user is running on a mobile or tablet device.
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent);
  return Boolean(isMobileUA || isTouch);
}

/**
 * Requests full screen with cross-browser compatibility.
 */
export function requestGameFullscreen(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();

  const doc = document.documentElement as any;
  const isCurrentlyFullscreen =
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement;

  if (isCurrentlyFullscreen) {
    return Promise.resolve();
  }

  try {
    if (doc.requestFullscreen) {
      return doc.requestFullscreen().catch(() => {});
    } else if (doc.webkitRequestFullscreen) {
      doc.webkitRequestFullscreen();
    } else if (doc.mozRequestFullScreen) {
      doc.mozRequestFullScreen();
    } else if (doc.msRequestFullscreen) {
      doc.msRequestFullscreen();
    }
  } catch {
    // Silently continue if browser blocks fullscreen
  }

  // Attempt orientation lock to landscape if supported
  try {
    if ((screen.orientation as any)?.lock) {
      (screen.orientation as any).lock('landscape').catch(() => {});
    }
  } catch {}

  return Promise.resolve();
}

/**
 * Exits fullscreen mode if active.
 */
export function exitGameFullscreen(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();

  const doc = document as any;
  try {
    if (document.exitFullscreen) {
      return document.exitFullscreen().catch(() => {});
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen();
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen();
    }
  } catch {}

  return Promise.resolve();
}

