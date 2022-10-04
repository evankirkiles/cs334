/*
 * ICharacter.ts
 * author: evan kirkiles
 * created on Sun Jul 24 2022
 * 2022 the nobot space,
 */

import { Character } from "../character/Character";

export interface ICharacterAI {
  character: Character;
  update(timeStep: number): void;
}
