/*
 * NobotManager.ts
 * author: evan kirkiles
 * created on Mon Sep 12 2022
 * 2022 the nobot space,
 */
import * as THREE from "three";
import * as Utils from "../core/FunctionLibrary";
import { ISpawnPoint } from "../interfaces/ISpawnPoint";
import { IUpdatable } from "../interfaces/IUpdatable";
import { Nobot } from "../nobots/Nobot";
import { NobotState } from "../nobots/states/NobotStateBase";
import { Walk } from "../nobots/states/Walk";
import { World } from "./World";

const PLAYER_MODEL = "/assets/nobots/nobot-anim.glb";

export class NobotManager implements IUpdatable {
  public updateOrder = 1;
  private entry: THREE.Object3D;
  private exit: THREE.Object3D;

  public isStarted: boolean = false;

  // nobot states
  public n_nobots: number;
  public n_spawned: number;
  public nobots: Nobot[] = [];
  public nobotSpeed: number = 0.6;

  /**
   * Instantiate the spawn point from a GLTF scene / scenario
   * @param object The object whose userData has nobot.spawn
   */
  constructor(
    entry: THREE.Object3D,
    exit: THREE.Object3D,
    n_nobots: number = 1
  ) {
    this.entry = entry;
    this.exit = exit;
    this.n_nobots = n_nobots;
    this.n_spawned = 0;
  }

  /**
   * Downloads a set of nobots to load into the world
   * @param world
   */
  public async load(world: World) {
    for (let i = 0; i < this.n_nobots; i++) {
      const playerGLTF = await world.loadingManager.loadGLTF(PLAYER_MODEL);
      this.nobots.push(new Nobot(playerGLTF));
    }
  }

  /**
   * Begins the stream of nobots walking across the screen. Spawns a single nobot
   * in, and then
   */
  public async start(world: World) {
    this.isStarted = true;
    await this.spawnNobot(this.nobots[0], world);
    world.registerUpdatable(this);
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.spawnNobot(this.nobots[i + 1], world);
      }, i * 2000 + 2000);
    }
  }

  /**
   * Updates the positions of the spawned nobots, moving them across the screen.
   */
  public update(timestep: number): void {
    for (let i = 0; i < this.n_spawned; i++) {
      this.nobots[i].position.z += timestep * this.nobotSpeed; // meters per second
      if (this.nobots[i].position.z > this.exit.position.z) {
        this.nobots[i].position.z = this.entry.position.z;
      }
    }
  }

  /**
   * Spawns the nobot player at this point in the scene
   * @param world The world in which the spawn point exists
   */
  public async spawnNobot(nobot: Nobot, world: World) {
    // const playerGLTF = await world.loadingManager.loadGLTF(PLAYER_MODEL);
    // const nobot = new Nobot(playerGLTF);
    const worldPos = new THREE.Vector3();
    this.entry.getWorldPosition(worldPos);
    nobot.setPosition(worldPos.x, worldPos.y, worldPos.z);
    const forward = Utils.getForward(this.entry);
    nobot.setOrientation(forward, true);
    world.add(nobot);
    nobot.setState(new Walk(nobot));
    this.n_spawned += 1;
  }
}
