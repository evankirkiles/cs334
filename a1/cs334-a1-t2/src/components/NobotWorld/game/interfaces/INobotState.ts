/*
 * INobotState.ts
 * author: evan kirkiles
 * created on Sat Jun 25 2022
 * 2022 the nobot space,
 */
export interface INobotState {
  update(timeStep: number): void;
  onInputChange(): void;
}
