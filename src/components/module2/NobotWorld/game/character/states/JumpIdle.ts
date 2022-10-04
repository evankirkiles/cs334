/*
 * JumpIdle.ts
 * author: evan kirkiles
 * created on Mon Jun 27 2022
 * 2022 the character space,
 */

import { Character } from "../Character";
import { Falling } from "./Falling";
import { CharacterStateBase } from "./CharacterStateBase";

export class JumpIdle extends CharacterStateBase {
  private alreadyJumped: boolean;

  /**
   * Begins a jump from idle character
   * @param character
   */
  constructor(character: Character) {
    super(character);
    this.character.velocitySimulator.mass = 30;
    this.character.setArcadeVelocityTarget(0);
    this.playAnimation("jump", 0.1);
    this.alreadyJumped = false;
  }

  /**
   * Updates the character's Y position while in a jump
   * @param timestep
   */
  public update(timestep: number) {
    super.update(timestep);
    // move in air
    if (this.alreadyJumped) {
      this.character.setCameraRelativeOrientationTarget();
      this.character.setArcadeVelocityTarget(this.anyDirection() ? 0.8 : 0);
    }
    // physicall jump
    if (this.timer > 0.2 && !this.alreadyJumped) {
      this.character.jump();
      this.alreadyJumped = true;
      this.character.velocitySimulator.mass = 100;
      this.character.rotationSimulator.damping = 0.3;
      if (
        this.character.rayResult.body &&
        this.character.rayResult.body.velocity.length() > 0
      ) {
        this.character.setArcadeVelocityInfluence(0, 0, 0);
      } else {
        this.character.setArcadeVelocityInfluence(0.3, 0, 0.3);
      }
    } else if (this.timer > 0.3 && this.character.rayHasHit) {
      this.setAppropriateDropState();
    } else if (this.animationEnded(timestep)) {
      this.character.setState(new Falling(this.character));
    }
  }
}
