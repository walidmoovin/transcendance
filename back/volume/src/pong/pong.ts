import { type WebSocket } from 'ws'
import { type GameInfo } from './game/constants'
import { Game } from './game/Game'
import { type Point } from './game/utils'
import { gameInfoConstants } from './game/constants'

export class Games {
  private readonly playerNameToGameIndex = new Map<string, number>()
  private readonly games = new Array<Game>()

  newGame (sockets: WebSocket[], uuids: string[], names: string[]): void {
    this.games.push(new Game(sockets, uuids, names))
    this.playerNameToGameIndex.set(names[0], this.games.length - 1)
    this.playerNameToGameIndex.set(names[1], this.games.length - 1)
    console.log(`Created game ${names[0]} vs ${names[1]}`)
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

  // stopGame (uuid: string): void {
  //   // if (this.isInAGame(uuid)) {
  //   //   this.playerGame(uuid).stop()
  //   //   delete this.playerNameToGameIndex[uuid]
  //   //   delete this.games[this.playerNameToGameIndex[uuid]]
  //   // }
  // }

  getGameInfo (name: string): GameInfo {
    const game: Game | null = this.playerGame(name)
    if (game !== null) {
      return game.getGameInfo(name)
    }
    return {
      ...gameInfoConstants,
      yourPaddleIndex: 0,
      gameId: ''
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
