/*
 * StartWalkBase.ts
 * author: evan kirkiles
 * created on Sun Jun 26 2022
 * 2022 the character space,
 */
import { Character } from "../Character";
import { CharacterStateBase } from "./CharacterStateBase";
import { Walk } from "./Walk";

export class StartWalkBase extends CharacterStateBase {
  /**
   * Inherited constructor for a character state for beginning to walk.
   * @param character
   */
  constructor(character: Character) {
    super(character);
    this.canEnterInteraction = true;
    this.character.rotationSimulator.mass = 20;
    this.character.rotationSimulator.damping = 0.7;
    this.character.setArcadeVelocityTarget(0.8);
  }

  /* -------------------------------------------------------------------------- */
  /*                                 UPDATE LOOP                                */
  /* -------------------------------------------------------------------------- */

  /**
   * Runs the start walk animation until it finishes, and then begins the real
   * walk animation.
   * @param timestep
   */
  public update(timestep: number): void {
    super.update(timestep);
    if (this.animationEnded(timestep)) {
      this.character.setState(new Walk(this.character));
    }
    this.character.setCameraRelativeOrientationTarget();
    this.checkFallInAir();
  }

  /**
   * When the input to the character from user changes
   */
  public onInputChange(): void {
    super.onInputChange();
  }
}
