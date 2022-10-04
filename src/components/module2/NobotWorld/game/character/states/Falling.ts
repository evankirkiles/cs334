/*
 * Falling.ts
 * author: evan kirkiles
 * created on Mon Jun 27 2022
 * 2022 the character space,
 */

import { Character } from "../Character";
import { CharacterStateBase } from "./CharacterStateBase";

export class Falling extends CharacterStateBase {
  /**
   * Add a falling state to the character
   * @param character
   */
  constructor(character: Character) {
    super(character);
    this.character.velocitySimulator.mass = 100;
    this.character.rotationSimulator.damping = 0.3;
    this.character.arcadeVelocityIsAdditive = true;
    this.character.setArcadeVelocityTarget(0.05, 0, 0.05);
    this.playAnimation("falling", 0.3);
  }

  /**
   * Update listeners for changing state on ground hit
   * @param timestep
   */
  public update(timestep: number): void {
    super.update(timestep);
    this.character.setCameraRelativeOrientationTarget();
    this.character.setArcadeVelocityTarget(this.anyDirection() ? 0.8 : 0);
    if (this.character.rayHasHit) {
      this.setAppropriateDropState();
    }
  }
}
