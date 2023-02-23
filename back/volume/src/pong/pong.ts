import { type WebSocket } from 'ws'
import { type GameInfo } from './game/constants'
import { Game } from './game/Game'
import { type Point } from './game/utils'

export class Games {
  private readonly playerNameToGameIndex = new Map<string, number>()
  private readonly games = new Array<Game>()

  newGame (sockets: WebSocket[], uuids: string[], names: string[]) {
    this.games.push(new Game(sockets, uuids, names))
    this.playerNameToGameIndex.set(names[0], this.games.length - 1)
    this.playerNameToGameIndex.set(names[1], this.games.length - 1)
    console.log(`Created game ${names[0]} vs ${names[1]}`)
  }

  removePlayer (name: string) {
    this.playerGame(name).removePlayer(name)
  }

  ready (name: string) {
    if (this.isInAGame(name)) {
      this.playerGame(name).ready(name)
    }
  }

  stopGame (uuid: string) {
    // if (this.isInAGame(uuid)) {
    //   this.playerGame(uuid).stop()
    //   delete this.playerNameToGameIndex[uuid]
    //   delete this.games[this.playerNameToGameIndex[uuid]]
    // }
  }

  getGameInfo (name: string): GameInfo {
    if (this.isInAGame(name)) {
      return this.playerGame(name).getGameInfo(name)
    }
  }

  movePlayer (name: string, position: Point) {
    if (this.isInAGame(name)) {
      this.playerGame(name).movePaddle(name, position)
    }
  }

  isInAGame (name: string): boolean {
    return this.playerNameToGameIndex.get(name) !== undefined
  }

  playerGame (name: string): Game {
    if (this.isInAGame(name)) {
      return this.games[this.playerNameToGameIndex.get(name)]
    }
  }

  spectateGame (
    nameToSpectate: string,
    socket: WebSocket,
    uuid: string,
    name: string
  ) {
    if (this.isInAGame(nameToSpectate)) {
      this.playerNameToGameIndex.set(
        name,
        this.playerNameToGameIndex.get(nameToSpectate)
      )
      this.playerGame(nameToSpectate).addSpectator(socket, uuid, name)
    }
  }
}
