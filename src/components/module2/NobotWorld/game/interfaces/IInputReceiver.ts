/*
 * IInputReceiver.ts
 * author: evan kirkiles
 * created on Sat Jun 25 2022
 * 2022 the nobot space,
 */

import { KeyBinding } from "../core/KeyBinding";

export type ControllerState = {
  buttons: number;
  js_x: number;
  js_y: number;
};

export interface IInputReceiver {
  actions: { [action: string]: KeyBinding };

  // event handlers
  handleKeyboardEvent(e: KeyboardEvent, code: string, pressed: boolean): void;
  handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void;
  handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void;
  handleMouseWheel(event: WheelEvent, value: number): void;
  handleController(state: ControllerState): void;

  // initialization and updating
  inputReceiverInit(): void;
  inputReceiverUpdate(timeStep: number): void;
}
