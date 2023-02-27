import { Ball } from "./Ball";
import { GAME_EVENTS } from "./constants";
import type { GameInfo, GameUpdate } from "./constants";
import { Paddle } from "./Paddle";
import { Player } from "./Player";
import { formatWebsocketData, Point, Rect } from "./utils";

const BG_COLOR = "black";

export class Game {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  ball: Ball;
  players: Player[];
  my_paddle: Paddle;
  id: string;
  walls: Rect[];

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.context = context;
    this.players = [];
    this.my_paddle = null;
    this.walls = [];
  }

  setInfo(data: GameInfo) {
    this.canvas.width = data.mapSize.x;
    this.canvas.height = data.mapSize.y;

    this.ball = new Ball(
      new Point(this.canvas.width / 2, this.canvas.height / 2),
      data.ballSize
    );

    const paddle1: Paddle = new Paddle(
      new Point(data.playerXOffset, this.canvas.height / 2),
      data.paddleSize
    );
    const paddle2: Paddle = new Paddle(
      new Point(this.canvas.width - data.playerXOffset, this.canvas.height / 2),
      data.paddleSize
    );
    this.players = [new Player(paddle1), new Player(paddle2)];
    if (data.yourPaddleIndex != -1)
      this.my_paddle = this.players[data.yourPaddleIndex].paddle;
    this.id = data.gameId;
    this.walls = data.walls.map(
      (w) =>
        new Rect(
          new Point(w.center.x, w.center.y),
          new Point(w.size.x, w.size.y)
        )
    );
  }

  start(socket: WebSocket) {
    if (this.my_paddle) {
      this.canvas.addEventListener("mousemove", (e) => {
        this.my_paddle.move(e);
        socket.send(
          formatWebsocketData(GAME_EVENTS.PLAYER_MOVE, {
            position: this.my_paddle.rect.center,
          })
        );
      });
      console.log("Game started!");
    }
  }

  update(data: GameUpdate) {
    if (this.players[0].paddle != this.my_paddle) {
      this.players[0].paddle.rect.center = data.paddlesPositions[0];
    }
    if (this.players[1].paddle != this.my_paddle) {
      this.players[1].paddle.rect.center = data.paddlesPositions[1];
    }
    this.ball.rect.center = data.ballPosition;
    for (let i = 0; i < data.scores.length; i++) {
      this.players[i].score = data.scores[i];
    }
  }

  draw() {
    this.context.fillStyle = BG_COLOR;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.walls.forEach((w) => w.draw(this.context, "white"));
    this.players.forEach((p) => p.draw(this.context));
    this.ball.draw(this.context);

    const max_width = 50;
    this.context.font = "50px Arial";
    const text_width = this.context.measureText("0").width;
    const text_offset = 50;
    this.players[0].drawScore(
      this.canvas.width / 2 - (text_width + text_offset),
      max_width,
      this.context
    );
    this.players[1].drawScore(
      this.canvas.width / 2 + text_offset,
      max_width,
      this.context
    );
  }
}
