import { Ball } from './Ball'
import { type Socket } from 'socket.io'
import { Point, Rect } from './utils'
import { Player } from './Player'
import {
  DEFAULT_BALL_SIZE,
  DEFAULT_PADDLE_SIZE,
  DEFAULT_WIN_SCORE,
  GAME_EVENTS,
  GAME_TICKS
} from './constants'
import { randomUUID } from 'crypto'
import { type MapDtoValidated } from '../dtos/MapDtoValidated'
import { type GameUpdate } from '../dtos/GameUpdate'
import { type GameInfo } from '../dtos/GameInfo'
import { type PongService } from '../pong.service'

export class Game {
  id: string
  timer: NodeJS.Timer | null
  map: MapDtoValidated
  ball: Ball
  players: Player[] = []
  playing: boolean
  ranked: boolean
  waitingForTimeout: boolean
  gameStoppedCallback: (name: string) => void

  constructor (
    sockets: Socket[],
    uuids: string[],
    names: string[],
    map: MapDtoValidated,
    gameStoppedCallback: (name: string) => void,
    private readonly pongService: PongService,
    ranked: boolean
  ) {
    this.id = randomUUID()
    this.timer = null
    this.playing = false
    this.ranked = ranked
    this.waitingForTimeout = false
    this.map = map
    this.gameStoppedCallback = gameStoppedCallback
    this.ball = new Ball(new Point(this.map.size.x / 2, this.map.size.y / 2))
    for (let i = 0; i < uuids.length; i++) {
      this.addPlayer(sockets[i], uuids[i], names[i])
    }
  }

  getGameInfo (name: string): GameInfo {
    const yourPaddleIndex = this.players.findIndex((p) => p.name === name)
    return {
      mapSize: this.map.size,
      yourPaddleIndex,
      gameId: this.id,
      walls: this.map.walls,
      paddleSize: DEFAULT_PADDLE_SIZE,
      ballSize: DEFAULT_BALL_SIZE,
      winScore: DEFAULT_WIN_SCORE,
      ranked: this.ranked
    }
  }

  private addPlayer (socket: Socket, uuid: string, name: string): void {
    let paddleCoords = new Point(
      DEFAULT_PADDLE_SIZE.x / 2,
      this.map.size.y / 2
    )
    if (this.players.length === 1) {
      paddleCoords = new Point(
        this.map.size.x - DEFAULT_PADDLE_SIZE.x / 2,
        this.map.size.y / 2
      )
    }
    this.players.push(
      new Player(socket, uuid, name, paddleCoords, this.map.size)
    )
    if (this.ranked) {
      this.ready(name)
    }
  }

  ready (name: string): void {
    const playerIndex: number = this.players.findIndex((p) => p.name === name)
    if (playerIndex !== -1 && !this.players[playerIndex].ready) {
      this.players[playerIndex].ready = true
      console.log(`${this.players[playerIndex].name} is ready`)
      if (this.players.length === 2 && this.players.every((p) => p.ready)) {
        this.start()
      }
    }
  }

  private start (): void {
    if (this.timer === null && this.players.length === 2) {
      this.ball = new Ball(new Point(this.map.size.x / 2, this.map.size.y / 2))
      this.players.forEach((p) => {
        void this.pongService.setInGame(p.name)
        p.newGame()
      })
      this.playing = true
      this.broadcastGame(GAME_EVENTS.START_GAME)
      this.timer = setInterval(this.gameLoop.bind(this), 1000 / GAME_TICKS)
      console.log(`Game ${this.id} starting in 3 seconds`)
      this.waitingForTimeout = true
      new Promise((resolve) => setTimeout(resolve, 3000))
        .then(() => (this.waitingForTimeout = false))
        .catch(() => {})
    }
  }

  stop (): void {
    if (this.timer !== null && this.playing) {
      this.playing = false
      clearInterval(this.timer)
      this.timer = null
      this.pongService
        .saveResult(this.players, this.ranked)
        .then(() => {
          this.gameStoppedCallback(this.players[0].name)
          this.players = []
        })
        .catch(() => {
          this.gameStoppedCallback(this.players[0].name)
          this.players = []
        })
    }
  }

  movePaddle (name: string | undefined, position: Point): void {
    const playerIndex: number = this.players.findIndex((p) => p.name === name)

    if (this.timer !== null && playerIndex !== -1) {
      this.players[playerIndex].paddle.move(position.y)
    }
  }

  private broadcastGame (event: string, data?: any): void {
    this.players.forEach((p) => {
      p.socket.emit(event, data)
    })
  }

  isPlaying (): boolean {
    return this.playing
  }

  private gameLoop (): void {
    if (this.waitingForTimeout) {
      return
    }

    const canvasRect: Rect = new Rect(
      new Point(this.map.size.x / 2, this.map.size.y / 2),
      new Point(this.map.size.x, this.map.size.y)
    )

    this.ball.update(
      canvasRect,
      this.players.map((p) => p.paddle),
      this.map
    )
    const indexPlayerScored: number = this.ball.getIndexPlayerScored()
    if (indexPlayerScored !== -1) {
      this.players[indexPlayerScored].score += 1
      if (this.players[indexPlayerScored].score >= DEFAULT_WIN_SCORE) {
        console.log(`${this.players[indexPlayerScored].name} won`)
        this.stop()
      }
    }

    const data: GameUpdate = {
      paddlesPositions: this.players.map((p) => p.paddle.rect.center),
      ballSpeed: this.ball.speed,
      ballPosition: this.ball.rect.center,
      scores: this.players.map((p) => p.score)
    }
    this.broadcastGame(GAME_EVENTS.GAME_TICK, data)
  }
}
