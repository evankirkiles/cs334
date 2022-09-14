/*
 * Scenario.ts
 * author: evan kirkiles
 * created on Sat Jun 25 2022
 * 2022 the nobot space,
 */
import * as THREE from "three";
import { CameraOperator } from "../core/CameraOperator";
import { LoadingManager } from "../core/LoadingManager";
import { WindowFrame } from "../core/WindowFrame";
import { ISpawnPoint } from "../interfaces/ISpawnPoint";
import { NobotManager } from "./NobotManager";
import { World } from "./World";

export class Scenario {
  // metadata
  public id: string;
  public spawnAlways: boolean = false;
  public default: boolean = false;
  public name?: string;
  public descriptionTitle?: string;
  public descriptionContent?: string;

  // world reference
  public world: World;

  // private scenario information
  private nobotManager: NobotManager;

  // build a scenario into the world
  constructor(root: THREE.Object3D, world: World) {
    this.world = world;
    this.id = root.name;

    // parse the scenario metadata
    if (Object.prototype.hasOwnProperty.call(root.userData, "name"))
      this.name = root.userData.name;
    if (Object.prototype.hasOwnProperty.call(root.userData, "default"))
      this.default = root.userData.default;

    // storage for scenario spawns and entries
    let frames: WindowFrame[] = [];
    let entry: THREE.Object3D | undefined = undefined;
    let exit: THREE.Object3D | undefined = undefined;
    root.traverse((child) => {
      if (
        Object.prototype.hasOwnProperty.call(child, "userData") &&
        Object.prototype.hasOwnProperty.call(child.userData, "data")
      ) {
        // spawn points are paths to walk between
        if (child.userData.data === "spawn") {
          // should only have one entry and exit pair per scenario
          if (child.userData.type === "entry") {
            entry = child;
          } else if (child.userData.type === "exit") {
            exit = child;
          }
          // cameras represent views into the scene, to be mapped into the viewport
        } else if (child.userData.data === "camera") {
          frames.push(
            new WindowFrame(
              child,
              parseInt(child.userData.index),
              parseFloat(child.userData.space_left)
            )
          );
        }
      }
    });

    // sort the cameras in order, so we render them in order. may need to do
    // some mapping to fix this functionality. then add them to the world
    frames = frames.sort((a, b) => a.window_index - b.window_index);
    this.world.cameraOperator = new CameraOperator(
      this.world,
      this.world.camera,
      frames,
      {
        ...this.world.ccamOptions,
      }
    );

    // add in a single nobot per camera.
    this.nobotManager = new NobotManager(entry!, exit!, frames.length);
  }

  /**
   * Launches the scenario.
   */
  public async launch(world: World) {
    await this.nobotManager.load(world);
    await this.nobotManager.start(world);
  }
}
