import { Ball } from './Ball'
import { type WebSocket } from 'ws'
import { formatWebsocketData, Point, Rect } from './utils'
import { Player } from './Player'
import {
  DEFAULT_BALL_SIZE,
  DEFAULT_PADDLE_SIZE,
  DEFAULT_PLAYER_X_OFFSET,
  DEFAULT_WIN_SCORE,
  GAME_EVENTS,
  GAME_TICKS
} from './constants'
import { randomUUID } from 'crypto'
import { Spectator } from './Spectator'
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
  spectators: Spectator[] = []
  playing: boolean
  ranked: boolean
  gameStoppedCallback: (name: string) => void

  constructor (
    sockets: WebSocket[],
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
      playerXOffset: DEFAULT_PLAYER_X_OFFSET,
      ballSize: DEFAULT_BALL_SIZE,
      winScore: DEFAULT_WIN_SCORE,
      ranked: this.ranked
    }
  }

  addSpectator (socket: WebSocket, uuid: string, name: string): void {
    this.spectators.push(new Spectator(socket, uuid, name))
    console.log(`Added spectator ${name}`)
  }

  private addPlayer (socket: WebSocket, uuid: string, name: string): void {
    let paddleCoords = new Point(DEFAULT_PLAYER_X_OFFSET, this.map.size.y / 2)
    if (this.players.length === 1) {
      paddleCoords = new Point(
        this.map.size.x - DEFAULT_PLAYER_X_OFFSET,
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
      this.broadcastGame(formatWebsocketData(GAME_EVENTS.START_GAME))
      this.timer = setInterval(this.gameLoop.bind(this), 1000 / GAME_TICKS)
      console.log(`Game ${this.id} started`)
    }
  }

  async stop (): Promise<void> {
    if (this.timer !== null) {
      await this.pongService.saveResult(this.players, this.ranked)
      if (this.players.length !== 0) {
        this.gameStoppedCallback(this.players[0].name)
      }

      clearInterval(this.timer)
      this.timer = null
      this.players = []
      this.playing = false
    }
  }

  movePaddle (name: string | undefined, position: Point): void {
    const playerIndex: number = this.players.findIndex((p) => p.name === name)

    if (this.timer !== null && playerIndex !== -1) {
      this.players[playerIndex].paddle.move(position.y)
    }
  }

  private broadcastGame (data: string): void {
    this.players.forEach((p) => {
      p.socket.send(data)
    })
    this.spectators.forEach((s) => {
      s.socket.send(data)
    })
  }

  isPlaying (): boolean {
    return this.playing
  }

  private gameLoop (): void {
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
        void this.stop()
      }
    }

    const data: GameUpdate = {
      paddlesPositions: this.players.map((p) => p.paddle.rect.center),
      ballPosition: this.ball.rect.center,
      scores: this.players.map((p) => p.score)
    }
    const websocketData: string = formatWebsocketData(
      GAME_EVENTS.GAME_TICK,
      data
    )
    this.broadcastGame(websocketData)
  }
}
