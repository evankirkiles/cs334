/*
 * NobotStateBase.ts
 * author: evan kirkiles
 * created on Sat Jun 25 2022
 * 2022 the nobot space,
 */
import { INobotState } from "../../interfaces/INobotState";
import { Nobot } from "../Nobot";

export enum NobotState {
  WALK = "walk",
  IDLE = "idle",
}

export abstract class NobotStateBase implements INobotState {
  public nobot: Nobot;
  public timer: number;
  public animationLength: any;

  /**
   * Builds the foundation of a state for a nobot
   * @param nobot The nobot this state applies to
   */
  constructor(nobot: Nobot) {
    this.nobot = nobot;

    // set arcade settings
    this.nobot.arcadeVelocityIsAdditive = false;
    this.nobot.setArcadeVelocityInfluence(1, 0, 1);

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
      this.nobot.actions.up.isPressed ||
      this.nobot.actions.down.isPressed ||
      this.nobot.actions.left.isPressed ||
      this.nobot.actions.right.isPressed
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                 ANIMATIONS                                 */
  /* -------------------------------------------------------------------------- */

  /**
   * Plays the animation of the state
   * @param animName The name of the animation in the Nobot GLTF
   * @param fadeIn How long to take in fading in the animation
   */
  protected playAnimation(animName: string, fadeIn: number): void {
    this.animationLength = this.nobot.setAnimation(animName, fadeIn);
  }

  /**
   * Returns whether or not the animation will have ended after the frame.
   * @param timeStep The timestep this frame will take
   */
  public animationEnded(timeStep: number): boolean {
    if (!this.nobot.mixer) return true;
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
    // if the nobot can find interactions and they press enter, look for them
    return;
  }
}
