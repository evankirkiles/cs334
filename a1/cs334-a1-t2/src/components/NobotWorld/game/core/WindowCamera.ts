/*
 * WindowCamera.ts
 * author: evan kirkiles
 * created on Mon Sep 12 2022
 * 2022 the nobot space,
 */
import * as THREE from "three";
import { Vector3 } from "three";
import { World } from "../world/World";

export class WindowCamera extends THREE.PerspectiveCamera {
  // scene / world properties
  public object: THREE.Object3D;
  public world: World;
  public window_index: number;

  // store the window index along with the perspective camera, so we can know
  // where to render the output of this camera
  constructor(
    object: THREE.Object3D,
    root: THREE.Object3D,
    world: World,
    window_index: number
  ) {
    super();
    this.object = object;
    this.world = world;
    this.window_index = window_index;
    this.fov = 20;
    const offset = 0.5;
    this.near = offset;
    this.far = 1000;
    this.zoom = 1;

    // set the position based on the window index
    const worldPos = new THREE.Vector3();
    const worldDirection = new THREE.Vector3();
    this.object.getWorldPosition(worldPos);
    this.object.getWorldDirection(worldDirection);
    this.position.set(worldPos.x + offset, worldPos.y, worldPos.z);
    this.rotation.copy(this.object.rotation);
    if (this.world.ccamOptions.rotated) this.rotation.z = Math.PI * -0.5;
    // this.lookAt(root.position);
  }
}
