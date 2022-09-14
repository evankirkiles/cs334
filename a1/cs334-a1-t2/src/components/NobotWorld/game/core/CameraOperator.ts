/*
 * CameraOperator.ts
 * author: evan kirkiles
 * created on Sat Jun 25 2022
 * 2022 the nobot space,
 */
import _, { xor } from "lodash";
import * as THREE from "three";
import { World } from "../world/World";
import { WindowFrame } from "./WindowFrame";

const safeLog = _.throttle((...s) => console.log(...s), 1000);

export class CameraOperator {
  public updateOrder: number = 4;

  // scene / world properties
  public world: World;
  public camera: THREE.PerspectiveCamera;
  public windowFrames: WindowFrame[] = [];
  public render_frames: number[] = [4, 5, 6];

  // dimensions of the viewing plane of the camera.
  private cX: number;
  private cLeft: number;
  private cBottom: number;
  private cWidth: number;
  private cHeight: number;
  // dimensions of a single cell. is always same height as camera.
  private cCellWidth: number;

  // dimensions of the viewport in the DOM
  private vWidth!: number;
  private vHeight!: number;
  // dimensions of a single cell. is always same height as browser window
  private vCellWidth!: number;

  // internal state managemenet
  private hFOV: number = 90;
  private focusPoint!: THREE.Vector3;

  /**
   * Constructs a CameraOperator which can be added as an updatable to the world.
   * The CameraOperator follows the nobot from its position, allowing for a minor
   * level of offset from mouse movement based on the mouse position in the canvas.
   * @param world
   * @param camera
   */
  constructor(
    world: World,
    camera: THREE.PerspectiveCamera,
    window_frames: WindowFrame[]
  ) {
    // set properties
    this.world = world;
    this.camera = camera;
    this.windowFrames = window_frames;

    // decompose the window frames into the actual total width within the scene
    let zBounds = [Infinity, -Infinity]; // min, max
    let yBounds = [Infinity, -Infinity]; // min, max
    for (let i = 0; i < window_frames.length; i++) {
      zBounds[0] = Math.min(window_frames[i].bbox.min.z, zBounds[0]);
      zBounds[1] = Math.max(window_frames[i].bbox.max.z, zBounds[1]);
      yBounds[0] = Math.min(window_frames[i].bbox.min.y, yBounds[0]);
      yBounds[1] = Math.max(window_frames[i].bbox.max.y, yBounds[1]);
    }
    // and set these as the camera's position in the ZY . note we do not set the
    // cell height, as this will be calculated based on the display's cell aspect ratio
    this.cLeft = zBounds[1];
    this.cWidth = zBounds[1] - zBounds[0];
    this.cBottom = yBounds[0];
    this.cHeight = yBounds[1] - yBounds[0]; // TEMPORARY VALUE
    this.cX = window_frames[0].object.position.x;
    const {
      min: { z: cellMinZ },
      max: { z: cellMaxZ },
    } = window_frames[0].bbox;
    this.cCellWidth = cellMaxZ - cellMinZ;

    // set the focus point of the camera
    this._calculateFocusPoint();
  }

  /**
   * Renders the camera to the screen
   * @param renderer
   */
  render(renderer: THREE.WebGLRenderer) {
    // render each frame onto its respective area.
    for (let i = 0; i < this.render_frames.length; i++) {
      const frame = this.windowFrames[this.render_frames[i] - 1];
      const left = i * this.vCellWidth;
      // safeLog(left, bottom, width, height);
      // set the renderer viewport / scissor to just this specific camera
      renderer.setViewport(left, 0, this.vCellWidth, this.vHeight);
      renderer.setScissor(left, 0, this.vCellWidth, this.vHeight);
      renderer.setScissorTest(true);
      this.camera.setViewOffset(
        this.vWidth,
        this.vHeight,
        frame.offsetX,
        frame.offsetY,
        this.vCellWidth,
        this.vHeight
      );
      renderer.render(this.world.graphicsWorld, this.camera);
    }
  }

  /**
   * Sets the point the camera is to look directly at.
   * @returns
   */
  _calculateFocusPoint() {
    this.focusPoint = new THREE.Vector3(
      this.cX,
      this.cBottom + this.cHeight / 2,
      this.cLeft - this.cWidth / 2
    );
  }

  /**
   * Use resize listener to update the camera's aspect ratio / fov.
   * @param width
   * @param height
   */
  onResize(width: number, height: number) {
    // get the target aspect ratio of each cell, and calculate the new height
    this.vCellWidth = width / this.render_frames.length;
    this.cHeight = this.cCellWidth / (this.vCellWidth / height);
    // now set the camera's aspect ratio from this
    this.camera.aspect = this.cWidth / this.cHeight;

    // calculate the camera's FOV from desired hFOV and aspect ratio
    this.camera.fov =
      (Math.atan(Math.tan((this.hFOV * Math.PI) / 360) / this.camera.aspect) *
        360) /
      Math.PI;
    console.log(this.camera.fov);
    // get necessary offset for camera from the viewport
    const near =
      this.cHeight / (2 * Math.tan((Math.PI * this.camera.fov) / 360));
    this.camera.near = near;

    // now move camera up so it captures everything above the scene
    this._calculateFocusPoint();
    const nearOffset = new THREE.Vector3(near, 0, 0);
    this.camera.position.copy(this.focusPoint).add(nearOffset);
    // for using horizontal aspect ratio, update the projection matrix. i don't
    // really know what is going on here.
    let e = this.camera.projectionMatrix.elements;
    e[5] = this.camera.aspect;
    e[0] = 1;
    // make camera look at the focus point
    this.camera.lookAt(this.focusPoint);
    // now propogate changes to camera
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    // lastly, update the camera's viewport dimensions
    this.vHeight = height;
    this.vWidth = height * this.camera.aspect;

    // iterate over each frame and set its xOffset.
    for (let i = 0; i < this.windowFrames.length; i++) {
      this.windowFrames[i].updateViewOffset(
        this.cLeft,
        this.cWidth,
        this.vWidth
      );
    }
  }
}
