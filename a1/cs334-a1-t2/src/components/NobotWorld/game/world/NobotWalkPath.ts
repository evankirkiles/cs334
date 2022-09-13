/*
 * NobotWalkPath.ts
 * author: evan kirkiles
 * created on Mon Sep 12 2022
 * 2022 the nobot space,
 */
import * as THREE from "three";
import * as Utils from "../core/FunctionLibrary";
import { LoadingManager } from "../core/LoadingManager";
import { ISpawnPoint } from "../interfaces/ISpawnPoint";
import { Nobot } from "../nobots/Nobot";
import { World } from "./World";

const PLAYER_MODEL = "/assets/nobots/nobot-anim.glb";

export class NobotWalkPath implements ISpawnPoint {
  private entry: THREE.Object3D;
  private exit: THREE.Object3D;

  /**
   * Instantiate the spawn point from a GLTF scene / scenario
   * @param object The object whose userData has nobot.spawn
   */
  constructor(entry: THREE.Object3D, exit: THREE.Object3D) {
    this.entry = entry;
    this.exit = exit;
  }

  /**
   * Spawns the nobot player at this point in the scene
   * @param world The world in which the spawn point exists
   */
  public async spawn(world: World) {
    const playerGLTF = await world.loadingManager.loadGLTF(PLAYER_MODEL);
    const nobot = new Nobot(playerGLTF);
    const worldPos = new THREE.Vector3();
    this.entry.getWorldPosition(worldPos);
    nobot.setPosition(worldPos.x, worldPos.y, worldPos.z);
    const forward = Utils.getForward(this.entry);
    nobot.setOrientation(forward, true);
    world.add(nobot);
  }
}
