/*
 * IControllable.ts
 * author: evan kirkiles
 * created on Sat Jun 25 2022
 * 2022 the character space,
 */
import { EntityType } from "../enums/EntityType";
import { Character } from "../character/Character";
import { IInputReceiver } from "./IInputReceiver";

export interface IControllable extends IInputReceiver {
  entityType: EntityType;
  position: THREE.Vector3;
  controllingCharacter: Character;

  triggerAction(actionName: string, value: boolean): void;
  resetControls(): void;
  allowSleep(value: boolean): void;
  onInputChange(): void;
  noDirectionPressed(): boolean;
}
