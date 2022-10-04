/*
 * CharacterStateBase.ts
 * author: evan kirkiles
 * created on Sat Jun 25 2022
 * 2022 the character space,
 */
import { ICharacterState } from "../../interfaces/ICharacterState";
import { Character } from "../Character";

export enum CharacterState {
  WALK = "walk",
  DROPIDLE = "dropIdle",
  IDLE = "idle",
  FALLING = "falling",
}

export abstract class CharacterStateBase implements ICharacterState {
  public character: Character;
  public timer: number;
  public animationLength: any;

  public canFindInteractions: boolean;
  public canEnterInteraction: boolean;
  public canLeaveInteraction: boolean;

  /**
   * Builds the foundation of a state for a character
   * @param character The character this state applies to
   */
  constructor(character: Character) {
    this.character = character;

    // apply default values to velocity simulator
    this.character.velocitySimulator.damping =
      this.character.defaultVelocitySimulatorDamping;
    this.character.velocitySimulator.mass =
      this.character.defaultVelocitySimulatorMass;
    // apply default values to rotation simulator
    this.character.rotationSimulator.damping =
      this.character.defaultRotationSimulatorDamping;
    this.character.rotationSimulator.mass =
      this.character.defaultRotationSimulatorMass;

    // set arcade settings
    this.character.arcadeVelocityIsAdditive = false;
    this.character.setArcadeVelocityInfluence(1, 0, 1);

    // interaction settings
    this.canFindInteractions = true;
    this.canEnterInteraction = false;
    this.canLeaveInteraction = true;

    // timer starts at 0
    this.timer = 0;
  }

  /* -------------------------------------------------------------------------- */
  /*                                 UPDATE LOOP                                */
  /* -------------------------------------------------------------------------- */

  /**
   * Increments the timer of the state
   * @param timeStep The time step used for calculations
   */
  public update(timeStep: number): void {
    this.timer += timeStep;
  }

  /* -------------------------------------------------------------------------- */
  /*                                  STATEFULS                                 */
  /* -------------------------------------------------------------------------- */

  /**
   * Gets whether or not a direction is pressed
   * @returns
   */
  public anyDirection(): boolean {
    return (
      this.character.actions.up.isPressed ||
      this.character.actions.down.isPressed ||
      this.character.actions.left.isPressed ||
      this.character.actions.right.isPressed
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                 ANIMATIONS                                 */
  /* -------------------------------------------------------------------------- */

  /**
   * Plays the animation of the state
   * @param animName The name of the animation in the Character GLTF
   * @param fadeIn How long to take in fading in the animation
   */
  protected playAnimation(animName: string, fadeIn: number): void {
    this.animationLength = this.character.setAnimation(animName, fadeIn);
  }

  /**
   * Returns whether or not the animation will have ended after the frame.
   * @param timeStep The timestep this frame will take
   */
  public animationEnded(timeStep: number): boolean {
    if (!this.character.mixer) return true;
    if (this.animationLength) {
      return this.timer > this.animationLength - timeStep;
    }
    console.error("Error: Set this.animationLength in state constructor!");
    return false;
  }

  /* -------------------------------------------------------------------------- */
  /*                                  LISTENERS                                 */
  /* -------------------------------------------------------------------------- */

  /**
   * Checks whether a user has attempted to begin an interaction
   */
  public onInputChange(): void {
    // if the character can find interactions and they press enter, look for them
    if (this.canFindInteractions && this.character.actions.use.justPressed) {
      // this.character TODO: Find interaction
      this.character.findInteraction();
      // if the character can enter interactions and they are in an interaction
    } else if (
      this.canEnterInteraction &&
      this.character.interactionEntryInstance !== null
    ) {
      // if the character presses any movement key, get out of the interaction
      if (
        this.character.actions.up.justPressed ||
        this.character.actions.down.justPressed ||
        this.character.actions.left.justPressed ||
        this.character.actions.right.justPressed
      ) {
        this.character.interactionEntryInstance = null;
        this.character.actions.up.isPressed = false;
      }
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                              STATE TRANSITIONS                             */
  /* -------------------------------------------------------------------------- */

  /**
   * Begins the adequate drop state a Character enters into after falling.
   */
  public setAppropriateDropState(): void {
    // if really falling hard, drop into a heavy impact
    if (this.character.groundImpactData.velocity.y < -6) {
      // console.log('hard drop');
      // STATE: Drop Hard
      this.character.setStateSerialized(CharacterState.WALK);
      // otherwise check if moving in any direction
    } else if (this.anyDirection()) {
      // on a minor drop, drop into a run (carrying velocity)
      if (this.character.groundImpactData.velocity.y < -2) {
        // STATE: Drop into a run
        this.character.setStateSerialized(CharacterState.WALK);
        // otherwise, continue the action the user was doing before
      } else {
        // STATE: Walk
        this.character.setStateSerialized(CharacterState.WALK);
      }
    } else {
      // if not moving in any direction, drop into idle
      this.character.setStateSerialized(CharacterState.DROPIDLE);
    }
  }

  /**
   * Sets the appropriate start walk state a Character enters into.
   */
  public setAppropriateStartWalkState(): void {
    // const range = Math.PI;
    // const angle = Utils.getSignedAngleBetweenVectors(
    //   this.character.orientation,
    //   this.character.getCameraRelativeMovementVector()
    // );
    this.character.setStateSerialized(CharacterState.WALK);
    // if (angle > range * 0.8) {
    //   this.character.setState(new StartWalkBackLeft(this.character));
    // } else if (angle < -range * 0.8) {
    //   this.character.setState(new StartWalkBackRight(this.character));
    // } else if (angle > range * 0.3) {
    //   this.character.setState(new StartWalkLeft(this.character));
    // } else if (angle < range * -0.3) {
    //   this.character.setState(new StartWalkRight(this.character));
    // } else {
    //   this.character.setState(new StartWalkForward(this.character));
    // }
  }

  /**
   * Runs the check if the Character should be falling, and, if so, begins the fall.
   */
  public checkFallInAir(): void {
    if (!this.character.rayHasHit) {
      this.character.setStateSerialized(CharacterState.FALLING);
    }
  }
}
