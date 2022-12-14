/*
 * InteractionEntryInstance.ts
 * author: evan kirkiles
 * created on Sat Jun 25 2022
 * 2022 the nobot space,
 */
import * as THREE from "three";
import { Character } from "./Character";

export class InteractionEntryInstance {
  public character: Character;
  public entryPoint?: THREE.Object3D;

  /**
   * Create an interaction entry instance, which manages how a character enters
   * into an interaction (i.e. sitting down, walking in, etc.).
   * @param character
   */
  constructor(character: Character) {
    this.character = character;
  }

  /**
   * Updates the interaction every timestep
   * @param timeStep The timestep to use in calculations
   */
  public update(timeStep: number): void {
    const entryPointWorldPos = new THREE.Vector3();
    this.entryPoint?.getWorldPosition(entryPointWorldPos);
    const viewVector = new THREE.Vector3().subVectors(
      entryPointWorldPos,
      this.character.position
    );
    this.character.setOrientation(viewVector);
  }
}
