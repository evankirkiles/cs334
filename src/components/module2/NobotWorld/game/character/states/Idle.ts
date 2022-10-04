/*
 * Idle.ts
 * author: evan kirkiles
 * created on Sat Jun 25 2022
 * 2022 the character space,
 */

import { Character } from "../Character";
import { JumpIdle } from "./JumpIdle";
import { CharacterStateBase } from "./CharacterStateBase";
import { Walk } from "./Walk";

export class Idle extends CharacterStateBase {
  /**
   * Add an Idle state to the Character, which immediately plays it.
   * @param character
   */
  constructor(character: Character) {
    super(character);
    // set simulator options
    this.character.velocitySimulator.damping = 0.6;
    this.character.velocitySimulator.mass = 10;
    this.character.setArcadeVelocityTarget(0);
    this.playAnimation("idle", 0.1);
  }

  /**
   * Updates the animation and checks if the character should be falling
   * @param timeStep The timestep to use in calculations
   */
  public update(timeStep: number): void {
    super.update(timeStep);
    this.checkFallInAir();
  }

  /**
   * When an input event happens, listen for new state transitions.
   */
  public onInputChange(): void {
    super.onInputChange();
    if (this.character.actions.jump.justPressed) {
      this.character.setState(new JumpIdle(this.character));
    }
    if (this.anyDirection()) {
      if (this.character.velocity.length() > 0.5) {
        this.character.setState(new Walk(this.character));
      } else {
        this.character.setState(new Walk(this.character));
        // this.setAppropriateStartWalkState();
      }
    }
  }
}
