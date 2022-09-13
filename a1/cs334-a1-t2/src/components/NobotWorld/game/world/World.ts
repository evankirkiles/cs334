/*
 * World.ts
 * author: evan kirkiles
 * created on Fri Jun 24 2022
 * 2022 the nobot space,
 * INSPIRATION: https://github.com/swift502/Sketchbook
 * so so so so so much credit and admiration to the guys who built Sketchbook.
 * incredible work. this would not have been possible without their contributions.
 */
import _ from "lodash";
import * as THREE from "three";
import { GLTF, RGBELoader } from "three-stdlib";
import { CameraOperator } from "../core/CameraOperator";
import * as Utils from "../core/FunctionLibrary";
import { InputManager } from "../core/InputManager";
import { LoadingManager } from "../core/LoadingManager";
import { WindowCamera } from "../core/WindowCamera";
import { IUpdatable } from "../interfaces/IUpdatable";
import { IWorldEntity } from "../interfaces/IWorldEntity";
import { Nobot } from "../nobots/Nobot";
import { Scenario } from "./Scenario";

const safeLog = _.throttle((...s) => console.log(...s), 1000);

export class World {
  // game properties
  public renderer: THREE.WebGLRenderer;
  public cameras: WindowCamera[] = [];
  public viewportWidth: number;
  public viewportHeight: number;

  // world assets
  public graphicsWorld: THREE.Scene;

  // render loop
  public clock: THREE.Clock;
  public renderDelta: number;
  public logicDelta: number;
  public sinceLastFrame: number;
  public requestDelta!: number;
  public justRendered: boolean;
  public timeScaleTarget: number = 1;
  public timeScale: number = 1;

  // physics
  public physicsFrameRate: number;
  public physicsFrameTime: number;
  public physicsMaxPrediction: number;

  // game entities
  public nobots: Nobot[] = [];
  public updatables: any[] = [];
  public scenarios: Scenario[] = [];

  // custom elements
  public inputManager: InputManager;
  public loadingManager: LoadingManager;

  // scenarios
  public lastScenarioID?: string;

  // html target
  public target: HTMLDivElement;

  // listeners, so can remove once component exits
  private listeners: { [key: string]: (() => void)[] } = {};

  /**
   * Construct a Nobot THREE.js world into the canvas!
   * @param target The div element to draw the scene into
   */
  constructor(
    target: HTMLDivElement,
    worldScenePath?: string,
    callbacks: {
      onDownloadStart?: () => void;
      onDownloadFinish?: () => void;
    } = {}
  ) {
    this.target = target;

    // initialize Renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setPixelRatio(0.3);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // set up resizing on window size change
    const onWindowResize = () => {
      // get the size of the canvas for aspect ratio
      const { width, height } = target.getBoundingClientRect();
      this.cameras.forEach((camera) => {
        camera.aspect = width / this.cameras.length / height;
        camera.updateProjectionMatrix();
      });
      this.viewportWidth = width;
      this.viewportHeight = height;
      this.renderer.setSize(width, height, false);
    };
    this.listeners.resize = [onWindowResize];
    window.addEventListener("resize", onWindowResize, false);

    // THREE.js scene
    this.graphicsWorld = new THREE.Scene();
    const { width, height } = target.getBoundingClientRect();
    this.viewportWidth = width;
    this.viewportHeight = height;
    onWindowResize();

    this.physicsFrameRate = 60;
    this.physicsFrameTime = 1 / this.physicsFrameRate;
    this.physicsMaxPrediction = this.physicsFrameRate;

    // render loop
    this.clock = new THREE.Clock();
    this.renderDelta = 0;
    this.logicDelta = 0;
    this.sinceLastFrame = 0;
    this.justRendered = false;

    // initialization
    this.inputManager = new InputManager(this, this.target);
    this.loadingManager = new LoadingManager(this, {
      onStart: callbacks.onDownloadStart,
      onProgress: (p) => console.log(p),
      onFinished: callbacks.onDownloadFinish,
    });

    // load scene if path is supplied
    if (worldScenePath) {
      this.openScene(worldScenePath).then(() => {
        // init cameras once scene loaded, and begin rendering
        onWindowResize();
        this.render(this);
      });
    }

    // connect the canvas up
    this.target.appendChild(this.renderer.domElement);
  }

  /**
   * Destroy the three.js instance, disposing of assets and removing the window
   * event listeners.
   */
  destroy() {
    this.target.removeChild(this.renderer.domElement);
    // remove input listener
    this.inputManager.deafen();
    // remove event listeners from window
    Object.keys(this.listeners).forEach((key) => {
      this.listeners[key].forEach((listener) => {
        window.removeEventListener(key, listener, false);
      });
    });
  }

  /* -------------------------------- UPDATING -------------------------------- */

  /**
   * Draws the world as seen through the camera.
   * @param world The world (this) to render
   */
  public render(world: World): void {
    this.requestDelta = this.clock.getDelta();
    requestAnimationFrame(() => {
      world.render(world);
    });

    // get the timestep
    const unscaledTimeStep =
      this.requestDelta + this.renderDelta + this.logicDelta;
    let timeStep = unscaledTimeStep * this.timeScale;
    timeStep = Math.min(timeStep, 1 / 30); // min 30 fps

    // logic
    world.update(timeStep, unscaledTimeStep);

    // measuring logic time
    this.logicDelta = this.clock.getDelta();

    // frame limiting
    const interval = 1 / 60;
    this.sinceLastFrame +=
      this.requestDelta + this.renderDelta + this.logicDelta;
    this.sinceLastFrame %= interval;

    // render each camera onto the canvas
    let left = 0;
    const bottom = 0;
    const width = this.viewportWidth / this.cameras.length;
    const height = this.viewportHeight;
    for (let i = 0; i < this.cameras.length; i++) {
      left = i * width;
      // set the renderer viewport / scissor to just this specific camera
      this.renderer.setViewport(left, bottom, width, height);
      safeLog(left, bottom, width, height);
      this.renderer.setScissor(left, bottom, width, height);
      this.renderer.setScissorTest(true);
      this.renderer.render(this.graphicsWorld, this.cameras[i]);
    }
    this.renderDelta = this.clock.getDelta();
  }

  /**
   * Updates the world and physics
   * @param timeStep
   */
  public update(timeStep: number, unscaledTimeStep: number): void {
    // update registered objects
    this.updatables.forEach((entity) => {
      entity.update(timeStep, unscaledTimeStep);
    });

    // Lerp time scale
    this.timeScale = THREE.MathUtils.lerp(
      this.timeScale,
      this.timeScaleTarget,
      0.2
    );
  }

  /* ---------------------------- STATE MANAGEMENT ---------------------------- */

  /**
   * Registers an entity for updates in the update cycle in this world.
   * @param registree The entity to update every timestep
   */
  public registerUpdatable(registree: IUpdatable) {
    this.updatables.push(registree);
    this.updatables.sort((a, b) => (a.updateOrder > b.updateOrder ? 1 : -1));
  }

  /**
   * Unregisters an entity for updates from this world.
   * @param registree The entity to remove from the update loop
   */
  public unregisterUpdatable(registree: IUpdatable) {
    _.pull(this.updatables, registree);
  }

  /**
   * Adds an entity to the world
   * @param worldEntity The entity to add to the world
   */
  public add(worldEntity: IWorldEntity): void {
    worldEntity.addToWorld(this);
    this.registerUpdatable(worldEntity);
  }

  /**
   * Removes an entity from the world
   * @param worldEntity The entity to remove from the world
   */
  public remove(worldEntity: IWorldEntity): void {
    worldEntity.removeFromWorld(this);
    this.unregisterUpdatable(worldEntity);
  }

  /**
   * Clears all entities from the world
   */
  public clearEntities(): void {
    for (let i = 0; i < this.nobots.length; i += 1) {
      this.remove(this.nobots[i]);
      i -= 1;
    }
  }

  /**
   * Update the world's timescale to LERP towards this value of update speed.
   * @param val
   */
  public setTimeScale(val: number) {
    this.timeScaleTarget = val;
  }

  /* ------------------------------ SCENE LOADING ----------------------------- */

  /**
   * Begins the download of a scene.
   */
  public async openScene(world: string): Promise<void> {
    const sceneGLTF = await this.loadingManager.loadGLTF(
      `/assets/worlds/${world}.glb`
    );
    await this.loadScene(sceneGLTF);
    this.update(1, 1);
    this.setTimeScale(1);
  }

  /**
   * Load in a scene from a GLB file. Each scene contains (in userData):
   *  - A scenario defining where users can spawn / actions
   *  - Meshes for visualization and rendering
   *  - Collision / physics data
   *  - Paths for AI
   * @param loadingManager
   */
  public async loadScene(gltf: GLTF) {
    // traverse the scene to populate the world
    gltf.scene.traverse((child) => {
      if (Object.prototype.hasOwnProperty.call(child, "userData")) {
        // for mesh children, update materials
        if (child.type === "Mesh") {
          Utils.setUpMeshProperties(child as THREE.Mesh);
        }
        // check if the child has physics data
        if (Object.prototype.hasOwnProperty.call(child.userData, "data")) {
          switch (child.userData.data) {
            // userData: SCENARIO
            case "scenario":
              this.scenarios.push(new Scenario(child, this));
              break;
            default:
              break;
          }
        }
      }
    });

    // add the scene to the world
    this.graphicsWorld.add(gltf.scene);

    // add a light to the scene
    // this.graphicsWorld.add(new THREE.AmbientLight(0x0f0f0f));
    this.graphicsWorld.add(new THREE.HemisphereLight("#76B6E7", "#E7324F"));
    // this.graphicsWorld.add(new THREE.HemisphereLight("#66B588", "#0D85AA"));

    // find default scenario
    let defaultScenarioID: string | null = null;
    for (let i = 0; i < this.scenarios.length; i += 1) {
      if (this.scenarios[i].default) {
        defaultScenarioID = this.scenarios[i].id;
        break;
      }
    }
    // launch default scenario
    if (defaultScenarioID) await this.launchScenario(defaultScenarioID);
  }

  /**
   * Launches a scenario into the world, essentially spawning the player at the
   * scenario position.
   * @param scenarioID The ID of the scenario (from the name in the file)
   */
  public async launchScenario(scenarioID: string) {
    this.lastScenarioID = scenarioID;
    this.clearEntities();
    // launch the scenario that matches by id
    const scenarioPromises: Promise<void>[] = [];
    for (let i = 0; i < this.scenarios.length; i += 1) {
      if (
        this.scenarios[i].id === scenarioID ||
        this.scenarios[i].spawnAlways
      ) {
        scenarioPromises.push(this.scenarios[i].launch(this));
      }
    }
    await Promise.all(scenarioPromises);
  }
}
