/*
 * CharacterPlayer.ts
 * author: evan kirkiles
 * created on Sat Jun 25 2022
 * 2022 the character space,
 */
import * as CANNON from "cannon-es";
import _ from "lodash";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
import * as Utils from "../core/FunctionLibrary";
import { KeyBinding } from "../core/KeyBinding";
import { CollisionGroups } from "../enums/CollisionGroups";
import { EntityType } from "../enums/EntityType";
import { IControllable } from "../interfaces/IControllable";
import { IInputReceiver } from "../interfaces/IInputReceiver";
import { ICharacterAI } from "../interfaces/ICharacterAI";
import { ICharacterState } from "../interfaces/ICharacterState";
import { IWorldEntity } from "../interfaces/IWorldEntity";
import { CapsuleCollider } from "../physics/colliders/CapsuleCollider";
import { RelativeSpringSimulator } from "../physics/simulators/RelativeSpringSimulator";
import { VectorSpringSimulator } from "../physics/simulators/VectorSpringSimulator";
import { World } from "../world/World";
import { GroundImpactData } from "./GroundImpactData";
import { InteractionEntryInstance } from "./InteractionEntryInstance";
import {
  DropIdle,
  Falling,
  Idle,
  CharacterState,
  Walk,
} from "./states/_stateLibrary";
import { ClosestObjectFinder } from "../core/ClosestObjectFinder";
import { IInteractable } from "../interfaces/IInteractable";

/**
 * The Character class is the controller interface for the Character, which is
 * loaded into the scene based on the user's own Character model. It takes in
 * information about the Character mesh and creates a corresponding collider that
 * is scaled based on the Character's own proportions.
 */
export class Character
  extends THREE.Object3D
  implements IWorldEntity, IInputReceiver
{
  // worldentity + updatable properties
  public updateOrder: number = 1;
  public entityType: EntityType = EntityType.Character;

  /* -------------------------------- GEOMETRY -------------------------------- */

  // model / geometry
  public height: number = 0;
  public tiltContainer: THREE.Group;
  public modelContainer: THREE.Group;
  public materials: THREE.Material[] = [];
  public mixer: THREE.AnimationMixer;
  public animations!: THREE.AnimationClip[];
  public currAnim?: THREE.AnimationClip;

  /* -------------------------------- MOVEMENT -------------------------------- */

  // movement state
  public moveSpeed: number = 2;
  public angularVelocity: number = 0;
  public acceleration: THREE.Vector3 = new THREE.Vector3();
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public velocityTarget: THREE.Vector3 = new THREE.Vector3();
  // movement: velocity simulator
  public defaultVelocitySimulatorDamping: number = 0.8;
  public defaultVelocitySimulatorMass: number = 50;
  public velocitySimulator: VectorSpringSimulator;
  // movement: rotation simulator
  public defaultRotationSimulatorDamping: number = 0.8;
  public defaultRotationSimulatorMass: number = 50;
  public rotationSimulator: RelativeSpringSimulator;
  // rotation:
  public orientation: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
  public orientationTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
  public viewVector: THREE.Vector3;
  // collision body
  public characterCapsule: CapsuleCollider;
  // arcade velocity refers to top-down local XZ rotation
  public arcadeVelocityInfluence: THREE.Vector3 = new THREE.Vector3();
  public arcadeVelocityIsAdditive: boolean = false;
  // whether or not physics are enabled
  private physicsEnabled: boolean = true;

  /* ------------------------------- RAYCASTING ------------------------------- */

  // raycasting
  public rayResult: CANNON.RaycastResult = new CANNON.RaycastResult();
  public rayHasHit: boolean = false;
  public raySafeOffset: number = 0.03;
  public raycastLength: number = 0.57;
  public raycastBox: THREE.Mesh;
  // jump state
  public wantsToJump: boolean = false;
  public initJumpSpeed: number = -1;
  public groundImpactData: GroundImpactData = new GroundImpactData();

  /* ------------------------------- INTERACTION ------------------------------ */

  // world references
  public world?: World;
  public preStepListener?: () => void;
  public postStepListener?: () => void;

  // current state
  public characterState!: ICharacterState;
  public behavior?: ICharacterAI;

  // controlled items
  public controlledObject?: IControllable;
  public interactionEntryInstance: InteractionEntryInstance | null = null;

  // action map
  public actions: { [key: string]: KeyBinding };

  /* -------------------------------------------------------------------------- */
  /*                               INITIALIZATION                               */
  /* -------------------------------------------------------------------------- */

  /**
   * Construct the Character Player from the GLTF model downloaded from the server.
   * @param gltf The custom character GLTF generated by the blender pipeline
   */
  constructor(gltf: GLTF) {
    super();

    /* ------------------------------- GEOMETRIES ------------------------------- */

    // initialize mesh + animation data
    this.readCharacterData(gltf);
    this.readCharacterAnimations(gltf);

    // the visuals group is centered for easy character tilting
    this.tiltContainer = new THREE.Group();
    this.add(this.tiltContainer);

    // model container is used to reliably ground the character, as animation
    // can alter the position of the model itself
    this.modelContainer = new THREE.Group();
    this.modelContainer.position.y = -0.57;
    this.tiltContainer.add(this.modelContainer);
    this.modelContainer.add(gltf.scene);

    // set up animation mixer
    this.mixer = new THREE.AnimationMixer(gltf.scene);

    // set up view vector
    this.viewVector = new THREE.Vector3();

    /* --------------------------------- PHYSICS -------------------------------- */

    // set up simulators for velocity and rotation
    this.velocitySimulator = new VectorSpringSimulator(
      60,
      this.defaultVelocitySimulatorMass,
      this.defaultVelocitySimulatorDamping
    );
    this.rotationSimulator = new RelativeSpringSimulator(
      60,
      this.defaultRotationSimulatorMass,
      this.defaultRotationSimulatorDamping
    );

    // player capsule
    this.characterCapsule = new CapsuleCollider({
      mass: 1,
      position: new CANNON.Vec3(),
      height: 0.5,
      radius: 0.25,
      segments: 8,
      friction: 0.0,
    });
    // add collisions with trimesh colliders
    this.characterCapsule.body.shapes.forEach((shape) => {
      shape.collisionFilterMask = ~CollisionGroups.TriMeshColliders; // eslint-disable-line no-bitwise
    });
    this.characterCapsule.body.allowSleep = false;
    // now move character to different collision group for raycasting
    this.characterCapsule.body.collisionFilterGroup =
      CollisionGroups.Characters;
    // disable character rotation
    this.characterCapsule.body.fixedRotation = true;
    this.characterCapsule.body.updateMassProperties();

    // Ray cast debug
    const boxGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const boxMat = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    this.raycastBox = new THREE.Mesh(boxGeo, boxMat);
    this.raycastBox.visible = false;

    /* ------------------------------- INTERACTION ------------------------------ */

    // map actions to keys
    this.actions = {
      up: new KeyBinding("KeyW"),
      down: new KeyBinding("KeyS"),
      left: new KeyBinding("KeyA"),
      right: new KeyBinding("KeyD"),
      run: new KeyBinding("ShiftLeft"),
      jump: new KeyBinding("Space"),
      use: new KeyBinding("KeyE"),
      primary: new KeyBinding("Mouse0"),
      secondary: new KeyBinding("Mouse1"),
    };

    // begin with the idle state
    this.setState(new Idle(this));
  }

  /* -------------------------------------------------------------------------- */
  /*                                  STATEFULS                                 */
  /* -------------------------------------------------------------------------- */

  /**
   * Updates the influence of arcade controls on the character
   */
  public setArcadeVelocityInfluence(
    x: number,
    y: number = x,
    z: number = x
  ): void {
    this.arcadeVelocityInfluence.set(x, y, z);
  }

  /**
   * Updates the target arcade velocity
   */
  public setArcadeVelocityTarget(
    z: number,
    x: number = 0,
    y: number = 0
  ): void {
    this.velocityTarget.x = x;
    this.velocityTarget.y = y;
    this.velocityTarget.z = z;
  }

  /**
   * Sets the direction in which the character is looking at
   */
  public setViewVector(vector: THREE.Vector3): void {
    this.viewVector.copy(vector).normalize();
  }

  /**
   * Sets the orientation of the Character, usually for beginning an interaction
   * @param vector The look vector
   * @param instantly Whether or not to change orientation instantly
   */
  public setOrientation(
    vector: THREE.Vector3,
    instantly: boolean = false
  ): void {
    const lookVector = new THREE.Vector3().copy(vector).setY(0).normalize();
    this.orientationTarget.copy(lookVector);
    if (instantly) {
      this.orientation.copy(lookVector);
    }
  }

  /**
   * Sets the position immediately of the character
   */
  public setPosition(x: number, y: number, z: number): void {
    this.characterCapsule.body.previousPosition = new CANNON.Vec3(x, y, z);
    this.characterCapsule.body.position = new CANNON.Vec3(x, y, z);
    this.characterCapsule.body.interpolatedPosition = new CANNON.Vec3(x, y, z);
  }

  /**
   * Sets the state of the Character.
   * @param state
   */
  public setState(state: ICharacterState): void {
    this.characterState = state;
    this.characterState.onInputChange();
  }

  /**
   * Sets the state of the character in a serialized manner (for tree-shaking the
   * state dict).
   * @param state
   */
  public setStateSerialized(state: CharacterState): void {
    switch (state) {
      case CharacterState.WALK:
        this.setState(new Walk(this));
        break;
      case CharacterState.DROPIDLE:
        this.setState(new DropIdle(this));
        break;
      case CharacterState.FALLING:
        this.setState(new Falling(this));
        break;
      case CharacterState.IDLE:
        this.setState(new Idle(this));
        break;
    }
  }

  /**
   * Begins an animation, returning how long it will take.
   * @param animName The name of the animation in the Character GLTF
   * @param fadeIn How long to take in fading in the animation
   */
  public setAnimation(animName: string, fadeIn: number): number {
    if (!this.mixer) return 0;
    const clip = THREE.AnimationClip.findByName(this.animations, animName);
    const action = this.mixer.clipAction(clip);
    if (action === null) {
      // console.error(`Animation ${animName} not found!`);
      return 0;
    }
    this.mixer.stopAllAction();
    if (this.currAnim) {
      const currAction = this.mixer.clipAction(this.currAnim);
      currAction.loop = THREE.LoopPingPong;
      currAction.timeScale = -1;
      currAction.play();
      currAction.crossFadeTo(action, fadeIn, false);
      action.timeScale = 1;
      action.loop = THREE.LoopRepeat;
    } else {
      action.fadeIn(fadeIn);
    }
    action.play();
    this.currAnim = clip;
    return action.getClip().duration;
  }

  /**
   * Mixes in an animation, not interrupting the currently-playing animation.
   * @param animName
   * @param fadeIn
   */
  public playAnimation(animName: string, fadeIn: number): number {
    if (!this.mixer) return 0;
    const clip = THREE.AnimationClip.findByName(this.animations, animName);
    const action = this.mixer.clipAction(clip);
    if (action === null) {
      // console.error(`Animation ${animName} not found!`);
      return 0;
    }
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = false;
    action.setEffectiveWeight(2);
    action.enabled = true;
    action.play().reset();
    return clip.duration;
  }

  /* -------------------------------------------------------------------------- */
  /*                                WORLD ENTITY                                */
  /* -------------------------------------------------------------------------- */

  /**
   * Add the character into the world at a spawn position.
   * @param world The target world instance
   */
  public addToWorld(world: World): void {
    // check to make sure the character is not already in the world
    if (_.includes(world.characters, this)) {
      console.warn("Could not add CHARACTER to world it already exists in!");
      // if not, then add the character to the world
    } else {
      this.world = world;
      world.characters.push(this);
      world.physicsWorld.addBody(this.characterCapsule.body);
      world.graphicsWorld.add(this);
      world.graphicsWorld.add(this.raycastBox);

      // add pre- and post- step listeners
      this.preStepListener = () => this.physicsPreStep();
      this.postStepListener = () => this.physicsPostStep();
      if (this.physicsEnabled) {
        world.physicsWorld.addEventListener("preStep", this.preStepListener);
        world.physicsWorld.addEventListener("postStep", this.postStepListener);
      } else {
        this.preStepListener();
      }
    }
  }

  /**
   * Remove the character from the world
   * @param world The target world instance
   */
  public removeFromWorld(world: World): void {
    // check to make sure the character is still in the world
    if (!_.includes(world.characters, this)) {
      console.warn("Could not remove CHARACTER from a world it is not in!");
      // if so, then remove the character from the world
    } else {
      if (world.inputManager.inputReceiver === this)
        world.inputManager.inputReceiver = undefined;
      this.world = undefined;

      // remove from characters, world, body
      _.pull(world.characters, this);
      world.physicsWorld.removeBody(this.characterCapsule.body);
      world.graphicsWorld.remove(this.raycastBox);
      world.graphicsWorld.remove(this);

      // remove pre- and post- step listeners
      if (this.physicsEnabled) {
        world.physicsWorld.removeEventListener(
          "preStep",
          this.preStepListener!
        );
        world.physicsWorld.removeEventListener(
          "postStep",
          this.postStepListener!
        );
      }
      this.preStepListener = undefined;
      this.postStepListener = undefined;
    }
  }

  /**
   * Sets this character as the receiver for input
   */
  public takeControl() {
    if (this.world) this.world.inputManager.setInputReceiver(this);
  }

  /* -------------------------------------------------------------------------- */
  /*                                 UPDATE LOOP                                */
  /* -------------------------------------------------------------------------- */

  /**
   * Perform a single step on the character character
   * @param timestep
   * @param unscaledTimeStep
   */
  public update(timestep: number): void {
    // update current external states
    this.behavior?.update(timestep);
    this.interactionEntryInstance?.update(timestep);
    this.characterState?.update(timestep);

    // update position and animations
    if (this.physicsEnabled) this.springMovement(timestep);
    if (this.physicsEnabled) this.springRotation(timestep);
    if (this.physicsEnabled) this.rotateModel();
    if (this.mixer) this.mixer.update(timestep);

    // sync physics with graphics
    if (this.physicsEnabled) {
      this.position.set(
        this.characterCapsule.body.interpolatedPosition.x,
        this.characterCapsule.body.interpolatedPosition.y,
        this.characterCapsule.body.interpolatedPosition.z
      );
    } else {
      const newPos = new THREE.Vector3();
      this.getWorldPosition(newPos);
      this.characterCapsule.body.position.copy(Utils.cannonVector(newPos));
      this.characterCapsule.body.interpolatedPosition.copy(
        Utils.cannonVector(newPos)
      );
    }
    // update the global transsform of the object
    this.updateMatrixWorld();
  }

  /* -------------------------------------------------------------------------- */
  /*                                   PHYSICS                                  */
  /* -------------------------------------------------------------------------- */

  /**
   * Enables or disables physics for the character body
   * @param value Physics enabled?
   */
  public setPhysicsEnabled(value: boolean): void {
    this.physicsEnabled = value;
    if (value) {
      this.world?.physicsWorld.addBody(this.characterCapsule.body);
    } else {
      this.world?.physicsWorld.removeBody(this.characterCapsule.body);
    }
  }

  /**
   * Function called before a physics step in the CANNON world
   */
  public physicsPreStep(): void {
    // perform the feet raycast
    this.feetRaycast();
    // raycast debug
    if (this.rayHasHit) {
      if (this.raycastBox.visible) {
        this.raycastBox.position.x = this.rayResult.hitPointWorld.x;
        this.raycastBox.position.y = this.rayResult.hitPointWorld.y;
        this.raycastBox.position.z = this.rayResult.hitPointWorld.z;
      }
    } else if (this.raycastBox.visible) {
      const { body } = this.characterCapsule;
      this.raycastBox.position.set(
        body.position.x,
        body.position.y - this.raycastLength - this.raySafeOffset,
        body.position.z
      );
    }
  }

  /**
   * Raycasts below the Character to see if it is on the ground
   */
  public feetRaycast(): void {
    // player raycasting
    const { body } = this.characterCapsule;
    const start = body.position.clone();
    const end = new CANNON.Vec3(
      body.position.x,
      body.position.y - this.raycastLength - this.raySafeOffset,
      body.position.z
    );
    // raycast options
    const rayCastOptions: CANNON.RayOptions = {
      collisionFilterMask: CollisionGroups.Default,
      skipBackfaces: true, // ignore back faces
    };
    // cast the ray
    this.rayHasHit = this.world!.physicsWorld.raycastClosest(
      start,
      end,
      rayCastOptions,
      this.rayResult
    );
  }

  /**
   * Function called after a step in the physics world. It updates the character's
   * velocity and coordinates the player's orientation.
   */
  public physicsPostStep(): void {
    /* -------------------------------- velocity -------------------------------- */

    // get velocities
    const { body } = this.characterCapsule;
    const simulatedVelocity = new THREE.Vector3(
      body.velocity.x,
      body.velocity.y,
      body.velocity.z
    );
    // take local velocity
    let arcadeVelocity = new THREE.Vector3()
      .copy(this.velocity)
      .multiplyScalar(this.moveSpeed);
    // turn local into global
    arcadeVelocity = Utils.applyVectorMatrixXZ(
      this.orientation,
      arcadeVelocity
    );
    let newVelocity = new THREE.Vector3();
    // additive velocity mode - add arcade velocity to current velocity
    if (this.arcadeVelocityIsAdditive) {
      newVelocity.copy(simulatedVelocity);
      const globalVelocityTarget = Utils.applyVectorMatrixXZ(
        this.orientation,
        this.velocityTarget
      );
      const add = new THREE.Vector3()
        .copy(arcadeVelocity)
        .multiply(this.arcadeVelocityInfluence);
      // add the arcade velocity to the current velocity
      if (
        Math.abs(simulatedVelocity.x) <
          Math.abs(globalVelocityTarget.x * this.moveSpeed) ||
        Utils.haveDifferentSigns(simulatedVelocity.x, arcadeVelocity.x)
      )
        newVelocity.x += add.x;
      if (
        Math.abs(simulatedVelocity.y) <
          Math.abs(globalVelocityTarget.y * this.moveSpeed) ||
        Utils.haveDifferentSigns(simulatedVelocity.y, arcadeVelocity.y)
      )
        newVelocity.y += add.y;
      if (
        Math.abs(simulatedVelocity.z) <
          Math.abs(globalVelocityTarget.z * this.moveSpeed) ||
        Utils.haveDifferentSigns(simulatedVelocity.z, arcadeVelocity.z)
      )
        newVelocity.z += add.z;
      // non-additive arcade velocity mode - arcade velocity is velocity
    } else {
      newVelocity = new THREE.Vector3(
        THREE.MathUtils.lerp(
          simulatedVelocity.x,
          arcadeVelocity.x,
          this.arcadeVelocityInfluence.x
        ),
        THREE.MathUtils.lerp(
          simulatedVelocity.y,
          arcadeVelocity.y,
          this.arcadeVelocityInfluence.y
        ),
        THREE.MathUtils.lerp(
          simulatedVelocity.z,
          arcadeVelocity.z,
          this.arcadeVelocityInfluence.z
        )
      );
    }

    /* ----------------------------- grounded checks ---------------------------- */

    // if we hit the ground, stay on the ground
    if (this.rayHasHit) {
      // flatten y-velocity
      newVelocity.y = 0;
      // move on top of moving objects
      if (this.rayResult.body!.mass > 0) {
        const pointVelocity = new CANNON.Vec3();
        this.rayResult.body!.getVelocityAtWorldPoint(
          this.rayResult.hitPointWorld,
          pointVelocity
        );
        newVelocity.add(Utils.threeVector(pointVelocity));
      }
      // measure the normal vector offset from direct "up vector" and transform
      // it into a matrix
      const up = new THREE.Vector3(0, 1, 0);
      const normal = new THREE.Vector3(
        this.rayResult.hitNormalWorld.x,
        this.rayResult.hitNormalWorld.y,
        this.rayResult.hitNormalWorld.z
      );
      const q = new THREE.Quaternion().setFromUnitVectors(up, normal);
      const m = new THREE.Matrix4().makeRotationFromQuaternion(q);
      // rotate the velocity vector
      newVelocity.applyMatrix4(m);
      // Apply velocity
      body.velocity.x = newVelocity.x;
      body.velocity.y = newVelocity.y;
      body.velocity.z = newVelocity.z;
      // Ground character
      body.position.y =
        this.rayResult.hitPointWorld.y +
        this.raycastLength +
        newVelocity.y / this.world!.physicsFrameRate;
      // otherwise, handle air maneuvering
    } else {
      // if character is in the air
      body.velocity.x = newVelocity.x;
      body.velocity.y = newVelocity.y;
      body.velocity.z = newVelocity.z;
      // Save last in-air information
      this.groundImpactData.velocity.x = body.velocity.x;
      this.groundImpactData.velocity.y = body.velocity.y;
      this.groundImpactData.velocity.z = body.velocity.z;
    }

    /* ------------------------------- jump checks ------------------------------ */

    // if character wants to jump, add upwards velocity
    if (this.wantsToJump) {
      // if init jump speed is set
      if (this.initJumpSpeed > -1) {
        // flatten velocity
        body.velocity.y = 0;
        // apply momentum in orientation
        const speed = Math.max(
          this.velocitySimulator.position.length() * this.moveSpeed,
          this.initJumpSpeed
        );
        body.velocity = Utils.cannonVector(
          this.orientation.clone().multiplyScalar(speed)
        );
      } else {
        // moving objects compensation
        const add = new CANNON.Vec3();
        this.rayResult.body?.getVelocityAtWorldPoint(
          this.rayResult.hitPointWorld,
          add
        );
        body.velocity.vsub(add, body.velocity);
      }

      // add positive vertical velocity
      body.velocity.y += 6;
      // Move above ground by 2x safe offset value
      body.position.y += this.raySafeOffset * 2;
      // Reset flag
      this.wantsToJump = false;
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                               INITIALIZATION                               */
  /* -------------------------------------------------------------------------- */

  /**
   * Reads in Character mesh data from the GLTF
   * @param gltf The server-generated GLTF character model
   */
  public readCharacterData(gltf: GLTF): void {
    gltf.scene.traverse((child) => {
      child.userData.ignoredByCamera = true;
      if (child instanceof THREE.Mesh && child.isMesh) {
        Utils.setUpMeshProperties(child);
        if (child.material) {
          this.materials.push(child.material);
        }
      }
    });
  }

  /**
   * Reads in Character animations from the GLTF
   * @param gltf The server-generated GLTF character model
   */
  public readCharacterAnimations(gltf: GLTF): void {
    this.animations = gltf.animations;
  }

  /* -------------------------------------------------------------------------- */
  /*                                  HANDLERS                                  */
  /* -------------------------------------------------------------------------- */

  /**
   * Triggers an action from an input event.
   * @param actionName The name of the action in the keyBinding
   * @param value An on/off toggle for the action
   */
  public triggerAction(actionName: string, value: boolean): void {
    // Get action and set its parameters
    const action = this.actions[actionName];
    if (action.isPressed !== value) {
      action.isPressed = value;
      // reset the 'just' attributes
      action.justPressed = false;
      action.justReleased = false;
      // set the 'just' attributes
      if (value) action.justPressed = true;
      else action.justReleased = true;
      // tell player to handle states according to input
      this.characterState.onInputChange();
      // reset the 'just' attributes
      action.justPressed = false;
      action.justReleased = false;
    }
  }

  /**
   * Funnels a keyboard event through to its action handler for the character.
   * @param event The keyboard event passed from an InputManager
   * @param code The keycode of the button pressed
   * @param pressed Whether or not the button was pressed or released
   */
  public handleKeyboardEvent(
    event: KeyboardEvent,
    code: string,
    pressed: boolean
  ): void {
    Object.keys(this.actions).forEach((action) => {
      if (Object.prototype.hasOwnProperty.call(this.actions, action)) {
        const binding = this.actions[action];
        if (_.includes(binding.eventCodes, code)) {
          this.triggerAction(action, pressed);
        }
      }
    });
  }

  /**
   * Funnels a mouse button event through to its action handler for the character.
   * @param event The mouse event passed from an InputManager
   * @param code The button pressed by the mouse
   * @param pressed Whether or not the button was pressed or released
   */
  public handleMouseButton(
    event: MouseEvent,
    code: string,
    pressed: boolean
  ): void {
    Object.keys(this.actions).forEach((action) => {
      if (Object.prototype.hasOwnProperty.call(this.actions, action)) {
        const binding = this.actions[action];
        if (_.includes(binding.eventCodes, code)) {
          this.triggerAction(action, pressed);
        }
      }
    });
  }

  /**
   * Funnels a mouse move event through to its action handler for the character.
   * @param event The mouse event passed from an InputManager
   * @param deltaX The motion of the mouse on the X axis
   * @param deltaY The motion of the mouse on the Y axis
   */
  public handleMouseMove(
    event: MouseEvent,
    deltaX: number,
    deltaY: number
  ): void {
    this.world?.cameraOperator.move(deltaX, deltaY);
  }

  /**
   * Funnels a wheel event through to its action handler for the character.
   * @param event The wheel event passed from an InputManager
   * @param value The deltaY of the wheel move
   */
  public handleMouseWheel(event: WheelEvent, deltaY: number): void {
    this.world?.cameraOperator.zoom(deltaY);
  }

  /* -------------------------------------------------------------------------- */
  /*                               INPUT RECEIVING                              */
  /* -------------------------------------------------------------------------- */

  /**
   * Initialize receiving of input
   */
  public inputReceiverInit(): void {
    if (!this.world) return;
    // if an object is being controlled, pass off to that object
    if (this.controlledObject) {
      this.controlledObject.inputReceiverInit();
      return;
    }
    // otherwise, make the camera follow this (MIGHT NEED TUNING)
    this.world.cameraOperator.setRadius(1.6, true);
    this.world.cameraOperator.followMode = false;
  }

  /**
   * Updates the input receiver to check for new events
   * @param timeStep The timestep to use in calculations
   */
  public inputReceiverUpdate(timeStep: number): void {
    if (!this.world) return;
    if (this.controlledObject !== undefined) {
      this.controlledObject.inputReceiverUpdate(timeStep);
    } else {
      // look in the camera's direction
      this.viewVector = new THREE.Vector3().subVectors(
        this.position,
        this.world.camera.position
      );
      this.getWorldPosition(this.world.cameraOperator.target);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                   CAMERA                                   */
  /* -------------------------------------------------------------------------- */

  /**
   * The direction of local movement of the character
   * @returns
   */
  public getLocalMovementDirection(): THREE.Vector3 {
    const positiveX = this.actions.right.isPressed ? -1 : 0;
    const negativeX = this.actions.left.isPressed ? 1 : 0;
    const positiveZ = this.actions.up.isPressed ? 1 : 0;
    const negativeZ = this.actions.down.isPressed ? -1 : 0;
    return new THREE.Vector3(
      positiveX + negativeX,
      0,
      positiveZ + negativeZ
    ).normalize();
  }

  /**
   * Get orientation movement vector relative to the camera
   */
  public getCameraRelativeMovementVector(): THREE.Vector3 {
    const localDirection = this.getLocalMovementDirection();
    const flatViewVector = new THREE.Vector3(
      this.viewVector.x,
      0,
      this.viewVector.z
    ).normalize();
    return Utils.applyVectorMatrixXZ(flatViewVector, localDirection);
  }

  /**
   * Get orientation movement vector relative to the camera
   */
  public setCameraRelativeOrientationTarget(): void {
    if (this.interactionEntryInstance) return;
    const moveVector = this.getCameraRelativeMovementVector();
    if (moveVector.x === 0 && moveVector.y === 0 && moveVector.z === 0) {
      this.setOrientation(this.orientation);
    } else {
      this.setOrientation(moveVector);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                  MOVEMENTS                                 */
  /* -------------------------------------------------------------------------- */

  /**
   * Jump function for triggering a jump
   */
  public jump(initJumpSpeed: number = -1): void {
    this.wantsToJump = true;
    this.initJumpSpeed = initJumpSpeed;
  }

  /**
   * Simulates movement based on the camera relative movement vector
   * @param timestep
   */
  public springMovement(timestep: number): void {
    this.velocitySimulator.target.copy(this.velocityTarget);
    this.velocitySimulator.simulate(timestep);
    this.velocity.copy(this.velocitySimulator.position);
    this.acceleration.copy(this.velocitySimulator.velocity);
  }

  /**
   * Simulates rotation
   * @param timestep
   */
  public springRotation(timestep: number): void {
    // figure out angle between current and target orientation
    const angle = Utils.getSignedAngleBetweenVectors(
      this.orientation,
      this.orientationTarget
    );

    // simulator
    this.rotationSimulator.target = angle;
    this.rotationSimulator.simulate(timestep);
    const rot = this.rotationSimulator.position;
    // updating values
    this.orientation.applyAxisAngle(new THREE.Vector3(0, 1, 0), rot);
    this.angularVelocity = this.rotationSimulator.velocity;
  }

  /**
   * Rotates the model to be in line with the orientation
   */
  public rotateModel(): void {
    this.lookAt(
      this.position.x + this.orientation.x,
      this.position.y + this.orientation.y,
      this.position.z + this.orientation.z
    );
    this.tiltContainer.rotation.z =
      -this.angularVelocity * 1.2 * this.velocity.length();
    this.tiltContainer.position.setY(
      Math.cos(Math.abs(this.angularVelocity * 2.3 * this.velocity.length())) /
        2 -
        0.5
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                 INTERACTION                                */
  /* -------------------------------------------------------------------------- */

  /**
   * Looks in the scene for an interaction in front of the character / player
   */
  public findInteraction(): void {
    // reusable world position variable
    const worldPos = new THREE.Vector3();
    // find the best interactable object in the world
    const interactionFinder = new ClosestObjectFinder<IInteractable>(
      this.position,
      0.8
    );
    this.world?.interactables.forEach((interactable) => {
      interactionFinder.consider(interactable);
    });

    // if no interactable object found, just exit
    if (!interactionFinder.closestObject) {
      this.playAnimation("wave", 0.3);
      return;
    }
    // otherwise, interact with it
    const interactable = interactionFinder.closestObject;
    interactable.onInteraction(this);
  }
}