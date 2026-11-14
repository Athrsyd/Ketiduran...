/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Lightweight, mutable input state for high-frequency touch events (joystick and look).
 * This completely avoids triggering React re-renders or global Zustand dispatches on every touchmove event,
 * which eliminates stuttering, lag, and main-thread blocking on mobile devices.
 */
export const inputState = {
  joystick: {
    x: 0,
    y: 0,
    active: false,
  },
  touchLookDeltaX: 0,

  setJoystick(x: number, y: number, active: boolean) {
    this.joystick.x = x;
    this.joystick.y = y;
    this.joystick.active = active;
  },

  addLookDelta(deltaX: number) {
    this.touchLookDeltaX += deltaX;
  },

  consumeLookDelta(): number {
    const d = this.touchLookDeltaX;
    this.touchLookDeltaX = 0;
    return d;
  },

  reset() {
    this.joystick.x = 0;
    this.joystick.y = 0;
    this.joystick.active = false;
    this.touchLookDeltaX = 0;
  },
};
