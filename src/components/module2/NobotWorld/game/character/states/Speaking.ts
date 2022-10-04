/*
 * Speaking.ts
 * author: evan kirkiles
 * created on Mon Jul 25 2022
 * 2022 the nobot space,
 */
import * as THREE from "three";
import { Character } from "../Character";
import { CharacterStateBase } from "./CharacterStateBase";
import { Idle } from "./_stateLibrary";

export class Speaking extends CharacterStateBase {
  public partner: Character;

  public canFindInteractions = false;
  public canEnterInteraction = false;
  public canLeaveInteraction = false;

  /**
   * Add a speaking state to the character. This will generally only be used
   * by the AI.
   * @param character
   */
  constructor(character: Character, partner: Character) {
    super(character);
    // set simulator options
    this.character.velocitySimulator.damping = 0.6;
    this.character.velocitySimulator.mass = 10;
    this.character.setArcadeVelocityTarget(0);
    this.playAnimation("speak", 0.1);
    this.partner = partner;
  }

  public update(timestep: number): void {
    super.update(timestep);
    const entryPointWorldPos = new THREE.Vector3();
    this.partner.getWorldPosition(entryPointWorldPos);
    // look at the partner
    const viewVector = new THREE.Vector3().subVectors(
      entryPointWorldPos,
      this.character.position
    );
    this.character.setOrientation(viewVector);
    if (this.animationEnded(timestep)) {
      this.character.setState(new Idle(this.character));
    }
  }

  public onInputChange(): void {
    super.onInputChange();
  }
}
