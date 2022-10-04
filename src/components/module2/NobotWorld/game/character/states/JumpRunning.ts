/*
 * JumpRunning.ts
 * author: evan kirkiles
 * created on Tue Jun 28 2022
 * 2022 the character space,
 */
import { Character } from "../Character";
import { Falling } from "./Falling";
import { CharacterStateBase } from "./CharacterStateBase";

export class JumpRunning extends CharacterStateBase {
  private alreadyJumped: boolean;

  /**
   * The character jump state when running
   * @param character
   */
  constructor(character: Character) {
    super(character);
    this.character.velocitySimulator.mass = 100;
    this.playAnimation("jump", 0.03);
    this.alreadyJumped = false;
  }

  /**
   * Recalculate the jump
   * @param timeStep
   */
  public update(timeStep: number): void {
    super.update(timeStep);
    this.character.setCameraRelativeOrientationTarget();
    // move in the air
    if (this.alreadyJumped) {
      this.character.setArcadeVelocityTarget(this.anyDirection() ? 0.8 : 0);
    }
    // physically jump
    if (this.timer > 0.13 && !this.alreadyJumped) {
      this.character.jump(4);
      this.alreadyJumped = true;
      this.character.rotationSimulator.damping = 0.3;
      this.character.arcadeVelocityIsAdditive = true;
      this.character.setArcadeVelocityInfluence(0.05, 0, 0.05);
    } else if (this.timer > 0.24 && this.character.rayHasHit) {
      this.setAppropriateDropState();
    } else if (this.animationEnded(timeStep)) {
      this.character.setState(new Falling(this.character));
    }
  }
}
