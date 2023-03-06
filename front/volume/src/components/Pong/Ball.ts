import { Point, Rect } from "./utils";

export class Ball {
  rect: Rect;
  speed: Point;

  constructor(
    spawn: Point,
    size: Point = new Point(20, 20)
  ) {
    this.rect = new Rect(spawn, size);
  }

  draw(context: CanvasRenderingContext2D, color: string) {
    this.rect.draw(context, color);
  }
}
