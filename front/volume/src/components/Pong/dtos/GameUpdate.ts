import type { Point } from "../utils";

export class GameUpdate {
  paddlesPositions!: Point[];
  ballPosition!: Point;
  scores!: number[];
}
