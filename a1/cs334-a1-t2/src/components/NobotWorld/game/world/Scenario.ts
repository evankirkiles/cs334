/*
 * Scenario.ts
 * author: evan kirkiles
 * created on Sat Jun 25 2022
 * 2022 the nobot space,
 */
import * as THREE from "three";
import { LoadingManager } from "../core/LoadingManager";
import { WindowCamera } from "../core/WindowCamera";
import { ISpawnPoint } from "../interfaces/ISpawnPoint";
import { NobotSpawnPoint } from "./NobotSpawnPoint";
import { NobotWalkPath } from "./NobotWalkPath";
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
  private rootNode: THREE.Object3D;
  private spawnPoints: ISpawnPoint[] = [];
  private invisible: boolean = false;
  private initialCameraAngle?: number;

  // build a scenario into the world
  constructor(root: THREE.Object3D, world: World) {
    this.rootNode = root;
    this.world = world;
    this.id = root.name;

    // parse the scenario metadata
    if (Object.prototype.hasOwnProperty.call(root.userData, "name"))
      this.name = root.userData.name;
    if (Object.prototype.hasOwnProperty.call(root.userData, "default"))
      this.default = root.userData.default;

    // storage for scenario spawns and entries
    const cameras: WindowCamera[] = [];
    let entry: THREE.Object3D | undefined = undefined;
    let exit: THREE.Object3D | undefined = undefined;
    root.traverse((child) => {
      console.log(child.name);
      if (
        Object.prototype.hasOwnProperty.call(child, "userData") &&
        Object.prototype.hasOwnProperty.call(child.userData, "data")
      ) {
        // spawn points are paths to walk between
        if (child.userData.data === "spawn") {
          // should only have one entry and exit pair per scenario
          if (child.userData.type === "entry") {
            entry = child;
            if (exit) {
              this.spawnPoints.push(new NobotWalkPath(entry, exit));
            }
          } else if (child.userData.type === "exit") {
            exit = child;
            if (entry) {
              this.spawnPoints.push(new NobotWalkPath(entry, exit));
            }
          }
          // cameras represent views into the scene, to be mapped into the viewport
        } else if (child.userData.data === "camera") {
          console.log("GOT A CAMERA");
          cameras.push(
            new WindowCamera(child, root, world, parseInt(child.userData.index))
          );
        }
      }
    });

    // sort the cameras in order, so we render them in order. may need to do
    // some mapping to fix this functionality. then add them to the world
    this.world.cameras = cameras
      .sort((a, b) => a.window_index - b.window_index)
      .filter(
        (_, i) => i >= this.world.windowsStart && i <= this.world.windowsEnd
      );
  }

  /**
   * Launches the scenario.
   */
  public async launch(world: World) {
    await Promise.all(this.spawnPoints.map((sp) => sp.spawn(world)));
  }
}
