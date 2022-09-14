/*
 * WindowFrame.ts
 * author: evan kirkiles
 * created on Mon Sep 12 2022
 * 2022 the nobot space,
 */
import * as THREE from "three";

/**
 * A WindowFrame represents a single box in the blender scene to be used as
 * the "frames" for the camera's rendering. Only their width matters––their
 * height is then calculated based on the aspect ratio of each viewing pane
 * in the display. Note that all window frames must be of equal width and height,
 * though the horizontal space between them can be variable.
 */
export class WindowFrame {
  // scene / world properties
  public object: THREE.Mesh;
  public window_index: number;

  public bbox: THREE.Box3;
  public offsetX!: number;
  public offsetY!: number;
  public space_left: number;
  public relative_left?: number;

  // store the window index along with the perspective camera, so we can know
  // where to render the output of this camera
  constructor(
    object: THREE.Object3D,
    window_index: number,
    space_left: number
  ) {
    this.object = object as THREE.Mesh;
    this.window_index = window_index;
    this.space_left = space_left;
    this.object.geometry.computeBoundingBox();
    this.bbox = new THREE.Box3().setFromObject(this.object);
  }

  // updates the view offset of the frame in the camera's view
  updateViewOffset(cLeft: number, cWidth: number, vWidth: number) {
    // the width is always going to be the same. so we only update the offsetX
    // once for each frame, and then we will always know where the frame is
    // in the camera's viewport (as it has the same height as the camera).
    this.offsetX = (cLeft - this.bbox.max.z) / (cWidth / vWidth);
    this.offsetY = 0;
  }
}
