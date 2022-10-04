/*
 * SpeechBubble.ts
 * author: evan kirkiles
 * created on Mon Jul 25 2022
 * 2022 the nobot space,
 */

import { EntityType } from "../enums/EntityType";
import { IUpdatable } from "../interfaces/IUpdatable";
import { IWorldEntity } from "../interfaces/IWorldEntity";
import { World } from "../world/World";

export class SpeechBubble implements IWorldEntity {
  updateOrder: number = 1;
  entityType: EntityType = EntityType.Decoration;

  constructor() {}
  addToWorld(world: World): void {
    throw new Error("Method not implemented.");
  }
  removeFromWorld(world: World): void {
    throw new Error("Method not implemented.");
  }

  /**
   *
   * @param timestep
   * @param unscaledTimeStep
   */
  update(timestep: number, unscaledTimeStep: number): void {
    throw new Error("Method not implemented.");
  }
}
