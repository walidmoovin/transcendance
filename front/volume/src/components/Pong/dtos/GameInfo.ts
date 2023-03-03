import type { Point, Rect } from "../utils";

export class GameInfo {
  mapSize!: Point;
  yourPaddleIndex!: number;
  gameId!: string;
  walls!: Rect[];
  paddleSize!: Point;
  playerXOffset!: number;
  ballSize!: Point;
  winScore!: number;
}
