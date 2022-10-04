/*
 * StartWalkBackLeft.ts
 * author: evan kirkiles
 * created on Sun Jun 26 2022
 * 2022 the nobot space,
 */

import { Character } from "../Character";
import { StartWalkBase } from "./StartWalkBase";

export class StartWalkBackLeft extends StartWalkBase {
  constructor(nobot: Character) {
    super(nobot);
    this.animationLength = nobot.setAnimation("start_back_left", 0.1);
  }
}
