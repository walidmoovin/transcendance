import { Point, Rect } from "./utils";

export class Ball {
  rect: Rect;
  speed: Point;
  color: string | CanvasGradient | CanvasPattern = "white";

  constructor(
    spawn: Point,
    size: Point = new Point(20, 20),
    speed: Point = new Point(10, 2)
  ) {
    this.rect = new Rect(spawn, size);
  }

  draw(context: CanvasRenderingContext2D) {
    this.rect.draw(context, this.color);
  }
}
