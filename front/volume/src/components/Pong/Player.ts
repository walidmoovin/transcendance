import type { Paddle } from "./Paddle";

export class Player {
  paddle: Paddle;
  score: number;

  constructor(paddle: Paddle) {
    this.paddle = paddle;
    this.score = 0;
  }

  draw(context: CanvasRenderingContext2D) {
    this.paddle.draw(context);
  }

  drawScore(
    score_position_x: number,
    max_width: number,
    context: CanvasRenderingContext2D
  ) {
    context.fillText(this.score.toString(), score_position_x, 50, max_width);
  }
}
