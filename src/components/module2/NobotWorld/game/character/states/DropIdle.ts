/*
 * DropIdle.ts
 * author: evan kirkiles
 * created on Tue Jun 28 2022
 * 2022 the character space,
 */

import { Character } from "../Character";
import { Idle } from "./Idle";
import { JumpIdle } from "./JumpIdle";
import { CharacterStateBase } from "./CharacterStateBase";
import { StartWalkForward } from "./StartWalkForward";
import { Walk } from "./Walk";

export class DropIdle extends CharacterStateBase {
  /**
   * Drop state, when the Character is not moving too fast.
   * @param character
   */
  constructor(character: Character) {
    super(character);
    this.character.velocitySimulator.damping = 0.5;
    this.character.velocitySimulator.mass = 7;
    this.character.setArcadeVelocityTarget(0);
    this.playAnimation("drop_idle", 0.1);
    if (this.anyDirection()) {
      this.character.setState(new StartWalkForward(character));
    }
  }

  public update(timestep: number): void {
    super.update(timestep);
    this.character.setCameraRelativeOrientationTarget();
    if (this.animationEnded(timestep)) {
      this.character.setState(new Idle(this.character));
    }
    this.checkFallInAir();
  }

  public onInputChange(): void {
    super.onInputChange();
    if (this.character.actions.jump.justPressed) {
      this.character.setState(new JumpIdle(this.character));
    }
    if (this.anyDirection()) {
      this.character.setState(new Walk(this.character));
    }
  }
}
