import { type WebSocket } from 'ws'
import { Game } from './Game'
import { Point } from './utils'
import { type MapDtoValidated as GameMap } from '../dtos/MapDtoValidated'
import { type GameCreationDtoValidated } from '../dtos/GameCreationDtoValidated'
import { type GameInfo } from '../dtos/GameInfo'
import { type PongService } from '../pong.service'
import {
  DEFAULT_BALL_SIZE,
  DEFAULT_PADDLE_SIZE,
  DEFAULT_PLAYER_X_OFFSET,
  DEFAULT_WIN_SCORE
} from './constants'

export class Games {
  constructor (private readonly pongService: PongService) {}
  private readonly playerNameToGameIndex = new Map<string, number>()
  private readonly games = new Array<Game>()

  newGame (
    sockets: WebSocket[],
    uuids: string[],
    gameCreationDto: GameCreationDtoValidated
  ): void {
    const names: string[] = gameCreationDto.playerNames
    const map: GameMap = gameCreationDto.map
    if (!this.isInAGame(names[0]) && !this.isInAGame(names[1])) {
      this.games.push(
        new Game(
          sockets,
          uuids,
          names,
          map,
          this.gameStopped.bind(this, names[0]),
          this.pongService
        )
      )
      this.playerNameToGameIndex.set(names[0], this.games.length - 1)
      this.playerNameToGameIndex.set(names[1], this.games.length - 1)
      console.log(
        `Created game ${names[0]} vs ${names[1]} (${
          this.games[this.games.length - 1].id
        })`
      )
    }
  }

  removePlayer (name: string): void {
    const game: Game | null = this.playerGame(name)
    if (game !== null) {
      game.removePlayer(name)
    }
  }

  ready (name: string): void {
    const game: Game | null = this.playerGame(name)
    if (game !== null) {
      game.ready(name)
    }
  }

  private gameStopped (name: string): void {
    const game: Game | null = this.playerGame(name)
    if (game !== null) {
      this.games.splice(this.games.indexOf(game), 1)
      game.players.forEach((player) => {
        this.playerNameToGameIndex.delete(player.name)
      })
      console.log(`Game stopped: ${game.id}`)
    }
  }

  getGameInfo (name: string): GameInfo {
    const game: Game | null = this.playerGame(name)
    if (game !== null) {
      return game.getGameInfo(name)
    }
    return {
      yourPaddleIndex: -2,
      gameId: '',
      mapSize: new Point(0, 0),
      walls: [],
      paddleSize: DEFAULT_PADDLE_SIZE,
      playerXOffset: DEFAULT_PLAYER_X_OFFSET,
      ballSize: DEFAULT_BALL_SIZE,
      winScore: DEFAULT_WIN_SCORE
    }
  }

  movePlayer (name: string | undefined, position: Point): void {
    const game: Game | null = this.playerGame(name)
    if (game !== null) {
      game.movePaddle(name, position)
    }
  }

  isInAGame (name: string | undefined): boolean {
    if (name === undefined) return false
    return this.playerNameToGameIndex.get(name) !== undefined
  }

  playerGame (name: string | undefined): Game | null {
    if (name === undefined) return null
    const gameIndex: number | undefined = this.playerNameToGameIndex.get(name)
    if (gameIndex !== undefined) {
      return this.games[gameIndex]
    }
    return null
  }

  spectateGame (
    nameToSpectate: string,
    socket: WebSocket,
    uuid: string,
    name: string
  ): void {
    const gameIndex: number | undefined =
      this.playerNameToGameIndex.get(nameToSpectate)
    if (gameIndex !== undefined) {
      this.playerNameToGameIndex.set(name, gameIndex)
      this.games[gameIndex].addSpectator(socket, uuid, name)
    }
  }
}
