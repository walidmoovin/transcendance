import { Ball } from './Ball'
import { type WebSocket } from 'ws'
import { formatWebsocketData, Point, Rect } from './utils'
import { Player } from './Player'
import {
  type GameInfo,
  gameInfoConstants,
  type GameUpdate,
  GAME_EVENTS
} from './constants'
import { randomUUID } from 'crypto'
import { Spectator } from './Spectator'

const GAME_TICKS = 30

function gameLoop (game: Game) {
  const canvas_rect = new Rect(
    new Point(gameInfoConstants.mapSize.x / 2, gameInfoConstants.mapSize.y / 2),
    new Point(gameInfoConstants.mapSize.x, gameInfoConstants.mapSize.y)
  )
  game.ball.update(
    canvas_rect,
    game.players.map((p) => p.paddle)
  )
  const index_player_scored: number = game.ball.getIndexPlayerScored()
  if (index_player_scored != -1) {
    game.players[index_player_scored].score += 1
    if (game.players[index_player_scored].score >= gameInfoConstants.winScore) {
      console.log(`${game.players[index_player_scored].name} won!`)
      game.stop()
    }
  }

  const data: GameUpdate = {
    paddlesPositions: game.players.map((p) => p.paddle.rect.center),
    ballPosition: game.ball.rect.center,
    scores: game.players.map((p) => p.score)
  }
  const websocketData: string = formatWebsocketData(
    GAME_EVENTS.GAME_TICK,
    data
  )
  game.broadcastGame(websocketData)
}

export class Game {
  id: string
  timer: NodeJS.Timer
  ball: Ball
  players: Player[] = []
  spectators: Spectator[] = []
  playing: boolean

  constructor (sockets: WebSocket[], uuids: string[], names: string[]) {
    this.id = randomUUID()
    this.timer = null
    this.ball = new Ball(
      new Point(
        gameInfoConstants.mapSize.x / 2,
        gameInfoConstants.mapSize.y / 2
      )
    )
    for (let i = 0; i < uuids.length; i++) {
      this.addPlayer(sockets[i], uuids[i], names[i])
    }
  }

  getGameInfo (name: string): GameInfo {
    const yourPaddleIndex = this.players.findIndex((p) => p.name == name)
    return {
      ...gameInfoConstants,
      yourPaddleIndex,
      gameId: this.id
    }
  }

  addSpectator (socket: WebSocket, uuid: string, name: string) {
    this.spectators.push(new Spectator(socket, uuid, name))
    console.log(`Added spectator ${name}`)
  }

  private addPlayer (socket: WebSocket, uuid: string, name: string) {
    let paddleCoords = new Point(
      gameInfoConstants.playerXOffset,
      gameInfoConstants.mapSize.y / 2
    )
    if (this.players.length == 1) {
      paddleCoords = new Point(
        gameInfoConstants.mapSize.x - gameInfoConstants.playerXOffset,
        gameInfoConstants.mapSize.y / 2
      )
    }
    this.players.push(
      new Player(socket, uuid, name, paddleCoords, gameInfoConstants.mapSize)
    )
  }

  removePlayer (name: string) {
    const player_index = this.players.findIndex((p) => p.name == name)
    if (player_index != -1) {
      this.players.splice(player_index, 1)
      if (this.players.length < 2) {
        this.stop()
      }
    }
  }

  ready (name: string) {
    const player_index = this.players.findIndex((p) => p.name == name)
    if (player_index != -1) {
      this.players[player_index].ready = true
      console.log(`${this.players[player_index].name} is ready!`)
      if (this.players.every((p) => p.ready)) {
        this.start()
      }
    }
  }

  private start (): boolean {
    if (!this.timer && this.players.length == 2) {
      this.ball = new Ball(
        new Point(
          gameInfoConstants.mapSize.x / 2,
          gameInfoConstants.mapSize.y / 2
        )
      )
      this.players.forEach((p) => {
        p.newGame()
      })

      this.timer = setInterval(gameLoop, 1000 / GAME_TICKS, this)
      this.broadcastGame(formatWebsocketData(GAME_EVENTS.START_GAME))
      console.log('Started game')
      this.playing = true
      return true
    }
    return false
  }

  stop () {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
      this.players = []
      this.playing = false
      console.log('Stopped game')
    }
  }

  movePaddle (name: string, position: Point) {
    const playerIndex = this.players.findIndex((p) => p.name == name)

    if (this.timer && playerIndex != -1) {
      this.players[playerIndex].paddle.move(position.y)
    }
  }

  broadcastGame (data: string) {
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
}
