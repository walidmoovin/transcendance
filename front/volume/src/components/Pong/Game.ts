import { Ball } from "./Ball";
import { GAME_EVENTS } from "./constants";
import type { GameInfo } from "./dtos/GameInfo";
import type { GameUpdate } from "./dtos/GameUpdate";
import { Paddle } from "./Paddle";
import { Player } from "./Player";
import { formatWebsocketData, Point, Rect } from "./utils";

const FPS = import.meta.env.VITE_FRONT_FPS;

export class Game {
  renderCanvas: HTMLCanvasElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  ball: Ball;
  players: Player[];
  my_paddle: Paddle;
  id: string;
  walls: Rect[];
  drawInterval: NodeJS.Timer;
  elementsColor: string;
  backgroundColor: string;
  ranked: boolean;
  youAreReady: boolean;

  constructor(
    renderCanvas: HTMLCanvasElement,
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    elementsColor: string,
    backgroundColor: string
  ) {
    this.renderCanvas = renderCanvas;
    this.canvas = canvas;
    this.context = context;
    this.players = [];
    this.my_paddle = null;
    this.id = "";
    this.walls = [];
    this.drawInterval = null;
    this.elementsColor = elementsColor;
    this.backgroundColor = backgroundColor;
    this.ranked = false;
    this.youAreReady = false;
  }

  setInfo(data: GameInfo) {
    this.renderCanvas.width = data.mapSize.x;
    this.renderCanvas.height = data.mapSize.y;
    this.canvas.width = data.mapSize.x;
    this.canvas.height = data.mapSize.y;
    this.ranked = data.ranked;
    this.youAreReady = false;
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
    if (this.drawInterval === null) {
      this.drawInterval = setInterval(() => {
        this.draw();
      }, 1000 / FPS);
    }
    console.log("Game updated!");
  }

  start(socket: WebSocket) {
    // if (this.my_paddle) {
    this.renderCanvas.addEventListener("pointermove", (e) => {
      this.my_paddle.move(e);
      const data: Point = this.my_paddle.rect.center;
      socket.send(formatWebsocketData(GAME_EVENTS.PLAYER_MOVE, data));
    });
    console.log("Game started!");
    // }
  }

  update(data: GameUpdate) {
    if (this.id !== "") {
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
  }

  updateColors(elementsColor: string, backgroundColor: string) {
    this.elementsColor = elementsColor;
    this.backgroundColor = backgroundColor;
  }

  draw() {
    this.context.fillStyle = this.backgroundColor;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.walls.forEach((w) => w.draw(this.context, this.elementsColor));
    this.players.forEach((p) => p.draw(this.context, this.elementsColor));
    this.ball.draw(this.context, this.elementsColor);

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

    this.renderCanvas.getContext("2d").drawImage(this.canvas, 0, 0);
  }
}
