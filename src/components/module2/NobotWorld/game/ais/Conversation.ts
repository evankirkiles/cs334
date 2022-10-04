/*
 * Conversation.ts
 * author: evan kirkiles
 * created on Mon Jul 25 2022
 * 2022 the nobot space,
 */
import * as THREE from "three";
import { Character } from "../character/Character";
import { KeyBinding } from "../core/KeyBinding";
import { ControllerState, IInputReceiver } from "../interfaces/IInputReceiver";
import { IUpdatable } from "../interfaces/IUpdatable";
import { IWorldEntity } from "../interfaces/IWorldEntity";
import { EntityType } from "../enums/EntityType";
import { World } from "../world/World";
import _ from "lodash";
import { Idle, Listening, Speaking } from "../character/states/_stateLibrary";
import { SpeechBubble } from "./SpeechBubble";
import { Conversant } from "./Conversant";

export class Conversation implements IWorldEntity, IInputReceiver {
  public updateOrder: number = 1;
  public entityType: EntityType = EntityType.Decoration;

  public world?: World;
  public speaker: Conversant;
  public listener: Character;

  public container: THREE.Object3D;
  public currentBubble?: SpeechBubble;

  actions: { [action: string]: KeyBinding };

  /**
   * Builds a conversation between a player and a character, handdling input
   * and stuff!
   * @param player
   * @param partner
   */
  constructor(speaker: Conversant, listener: Character) {
    this.speaker = speaker;
    this.listener = listener;

    this.actions = {
      next: new KeyBinding("KeyE"),
    };

    this.container = new THREE.Object3D();
  }

  /* -------------------------------------------------------------------------- */
  /*                                WORLD ENTITY                                */
  /* -------------------------------------------------------------------------- */

  /**
   * Adds the conversation to the world, grabbing input and setting the states
   * of each of the participants of the conversation.
   * @param world
   */
  addToWorld(world: World): void {
    // make sure the conversation is not already in the world
    if (_.includes(world.updatables, this)) {
      console.warn("Could not add CONVERSATION to world it already exists in!");
      // if not, add it to the world and set the states of the characters
    } else {
      this.world = world;
      world.updatables.push(this);
      world.graphicsWorld.add(this.container);
      this.speaker.setState(new Speaking(this.speaker, this.listener));
      this.listener.setState(new Listening(this.listener, this.speaker));
    }
  }

  /**
   * Removes the conversation from the world, reverting participants back to idle.
   * @param world
   */
  removeFromWorld(world: World): void {
    // make sure the conversation is in the world
    if (!_.includes(world.updatables, this)) {
      console.warn(
        "Could not remove CONVERSATION from a world it does not exist in!"
      );
      // if not, add it to the world and set the states of the characters
    } else {
      if (world.inputManager.inputReceiver === this)
        world.inputManager.inputReceiver = this.listener;
      _.pull(world.updatables, this);
      world.cameraOperator.overrideTarget = undefined;
      world.graphicsWorld.remove(this.container);
      this.speaker.setState(new Idle(this.speaker));
      this.listener.setState(new Idle(this.listener));
      this.speaker.onConversationEnd();
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                  HANDLERS                                  */
  /* -------------------------------------------------------------------------- */

  /**
   * When an input event happens, listen for new state transitions.
   */
  public onInputChange(): void {
    if (this.actions.next.justPressed && this.world) {
      this.removeFromWorld(this.world);
    }
  }

  /**
   * Triggers an action from an input event
   * @param actionName
   * @param value
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
      // handle state according to input
      this.onInputChange();
      // reset the 'just' attributes
      action.justPressed = false;
      action.justReleased = false;
    }
  }

  handleKeyboardEvent(e: KeyboardEvent, code: string, pressed: boolean): void {
    Object.keys(this.actions).forEach((action) => {
      if (Object.prototype.hasOwnProperty.call(this.actions, action)) {
        const binding = this.actions[action];
        if (_.includes(binding.eventCodes, code)) {
          this.triggerAction(action, pressed);
        }
      }
    });
  }

  handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void {
    return;
  }

  handleController(state: ControllerState): void {
    const a = this;
  }

  /**
   * We pass mouse move events through to the listener, who is generally the
   * player who controls the camera. So we can move the camera around in the
   * conversation, but not move the player. We also have to make sure that the
   * camera is continually looking at the listener, despite rotating around the speaker.
   * @param event
   * @param deltaX
   * @param deltaY
   */
  handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void {
    return;
  }
  handleMouseWheel(event: WheelEvent, value: number): void {
    return;
  }

  /**
   * Move the camera operator over to the triangular point focused on the midway
   * between the two characters on the . We just set a default height here
   * @returns
   */
  inputReceiverInit(): void {
    if (!this.world) return;
    // add an override target
    this.world.cameraOperator.overrideTarget = new THREE.Vector3();
  }
  inputReceiverUpdate(timeStep: number): void {
    if (!this.world) return;
    // look in the speaker's direction
    this.speaker.getWorldPosition(this.world.cameraOperator.overrideTarget!);
  }

  /* -------------------------------------------------------------------------- */
  /*                                  UPDATING                                  */
  /* -------------------------------------------------------------------------- */

  /**
   * Updates the interaction every timestep
   * @param timeStep The timestep to use in calculations
   */
  public update(timeStep: number): void {}
}
