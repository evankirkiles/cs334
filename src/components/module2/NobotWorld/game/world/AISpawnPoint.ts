/*
 * AISpawnPoint.ts
 * author: evan kirkiles
 * created on Sun Jul 24 2022
 * 2022 the nobot space,
 */
import * as THREE from "three";
import * as Utils from "../core/FunctionLibrary";
import { LoadingManager } from "../core/LoadingManager";
import { ISpawnPoint } from "../interfaces/ISpawnPoint";
import { Character } from "../character/Character";
import { World } from "./World";
import { Conversant } from "../ais/Conversant";

enum CharacterModel {
  KITTY = "kitty",
  NOBOT = "nobot",
  EVAN = "evan",
}

const CHARACTERS = {
  [CharacterModel.KITTY]: "/assets/characters/hellokitty.glb",
  [CharacterModel.NOBOT]: "/assets/characters/nobot-anim.glb",
  [CharacterModel.EVAN]: "/assets/characters/evan.glb",
};

export class AISpawnPoint implements ISpawnPoint {
  private object: THREE.Object3D;
  public model: string;

  /**
   * Instantiate the spawn point from a GLTF scene / scenario
   * @param object The object whose userData has nobot.spawn
   */
  constructor(object: THREE.Object3D, character: CharacterModel) {
    this.object = object;
    this.model = CHARACTERS[character];
  }

  /**
   * Spawns an AI agent at this point in the scene
   * @param world The world in which the spawn point exists
   */
  public async spawn(world: World) {
    const playerGLTF = await world.loadingManager.loadGLTF(this.model);
    const conversant = new Conversant(playerGLTF);
    const worldPos = new THREE.Vector3();
    this.object.getWorldPosition(worldPos);
    conversant.setPosition(worldPos.x, worldPos.y, worldPos.z);
    const forward = Utils.getForward(this.object);
    conversant.setOrientation(forward, true);
    world.add(conversant);
  }
}
