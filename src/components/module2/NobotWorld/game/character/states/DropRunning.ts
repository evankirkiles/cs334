/*
 * DropRunning.ts
 * author: evan kirkiles
 * created on Tue Jun 28 2022
 * 2022 the character space,
 */

import { Character } from "../Character";
import { EndWalk } from "./EndWalk";
import { JumpRunning } from "./JumpRunning";
import { CharacterStateBase } from "./CharacterStateBase";
import { Walk } from "./Walk";

export class DropRunning extends CharacterStateBase {
  constructor(character: Character) {
    super(character);
    this.character.setArcadeVelocityTarget(0.8);
    this.playAnimation("drop_running", 0.1);
  }
  public update(timeStep: number): void {
    super.update(timeStep);
    this.character.setCameraRelativeOrientationTarget();
    if (this.animationEnded(timeStep)) {
      this.character.setState(new Walk(this.character));
    }
  }
  public onInputChange(): void {
    super.onInputChange();
    if (!this.anyDirection()) {
      this.character.setState(new EndWalk(this.character));
    }
    if (this.character.actions.jump.justPressed) {
      this.character.setState(new JumpRunning(this.character));
    }
  }
}
