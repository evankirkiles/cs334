/*
 * EndWalk.ts
 * author: evan kirkiles
 * created on Sun Jun 26 2022
 * 2022 the character space,
 */
import { Character } from "../Character";
import { Idle } from "./Idle";
import { CharacterStateBase } from "./CharacterStateBase";

export class EndWalk extends CharacterStateBase {
  /**
   * Stops the character from walking.
   * @param character
   */
  constructor(character: Character) {
    super(character);
    this.character.setArcadeVelocityTarget(0);
    this.animationLength = character.setAnimation("stop", 0.1);
  }

  /**
   * Check for animation finish and fall begins
   * @param timeStep
   */
  public update(timeStep: number): void {
    super.update(timeStep);
    if (this.animationEnded(timeStep)) {
      this.character.setState(new Idle(this.character));
    }
    this.checkFallInAir();
  }
}
