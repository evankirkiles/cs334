/*
 * Conversant.ts
 * author: evan kirkiles
 * created on Sun Jul 24 2022
 * 2022 the nobot space,
 */

import _ from "lodash";
import { Character } from "../character/Character";
import { Speaking } from "../character/states/Speaking";
import { IInteractable } from "../interfaces/IInteractable";
import { World } from "../world/World";
import { Conversation } from "./Conversation";

export class Conversant extends Character implements IInteractable {
  public conversation?: Conversation;

  /**
   * When an interaction begins with this character, enter into a conversation
   * @param player
   */
  onInteraction(player: Character): void {
    if (!this.world || this.conversation) return;
    this.conversation = new Conversation(this, player);
    this.conversation.addToWorld(this.world);
    // make the conversation take input in the world
    this.world.inputManager.setInputReceiver(this.conversation);
  }

  /**
   * Ends the conversation.
   */
  onConversationEnd(): void {
    this.conversation = undefined;
  }

  /* -------------------------------------------------------------------------- */
  /*                               ADDING TO WORLD                              */
  /* -------------------------------------------------------------------------- */

  /**
   * Adds the conversant to the world––and the world's interactions.
   * @param world
   */
  public addToWorld(world: World): void {
    super.addToWorld(world);
    if (!_.includes(world.interactables, this)) {
      world.interactables.push(this);
    }
  }

  /**
   * Removes the conversant to the world––and the world's interactions.
   * @param world
   */
  public removeFromWorld(world: World): void {
    super.removeFromWorld(world);
    if (_.includes(world.interactables, this)) {
      _.pull(world.interactables, this);
    }
  }
}
