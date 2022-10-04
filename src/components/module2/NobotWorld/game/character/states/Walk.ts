/*
 * Walk.ts
 * author: evan kirkiles
 * created on Sun Jun 26 2022
 * 2022 the character space,
 */

import { Character } from "../Character";
import { EndWalk } from "./EndWalk";
import { CharacterStateBase } from "./CharacterStateBase";
// eslint-disable-next-line
import { Idle, JumpRunning } from "./_stateLibrary";

export class Walk extends CharacterStateBase {
  /**
   * Represents the walking animation for the character.
   * @param character
   */
  constructor(character: Character) {
    super(character);
    this.canEnterInteraction = true;
    this.character.setArcadeVelocityTarget(0.8);
    this.playAnimation("walk", 0.2);
  }

  /* -------------------------------------------------------------------------- */
  /*                                 UPDATE LOOP                                */
  /* -------------------------------------------------------------------------- */

  /**
   * Updates the camera and checks if falling
   * @param timeStep
   */
  public update(timeStep: number): void {
    super.update(timeStep);
    this.character.setCameraRelativeOrientationTarget();
    this.checkFallInAir();
  }

  /**
   * When a button input changes
   */
  public onInputChange(): void {
    super.onInputChange();
    if (!this.anyDirection())
      this.character.setState(new EndWalk(this.character));
    if (this.character.actions.jump.justPressed)
      this.character.setState(new JumpRunning(this.character));
    if (!this.anyDirection()) {
      if (this.character.velocity.length() > 1) {
        // this.character.setState(new EndWalk(this.character));
        this.character.setState(new Idle(this.character));
      } else {
        this.character.setState(new Idle(this.character));
      }
    }
  }
}
