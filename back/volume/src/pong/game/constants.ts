import { Point, type Rect } from './utils'

export const GAME_EVENTS = {
  START_GAME: 'START_GAME',
  READY: 'READY',
  GAME_TICK: 'GAME_TICK',
  PLAYER_MOVE: 'PLAYER_MOVE',
  GET_GAME_INFO: 'GET_GAME_INFO',
  CREATE_GAME: 'CREATE_GAME',
  REGISTER_PLAYER: 'REGISTER_PLAYER',
  SPECTATE: 'SPECTATE'
}

export interface GameInfo extends GameInfoConstants {
  yourPaddleIndex: number
  gameId: string
  walls: Rect[]
}
export interface GameInfoConstants {
  mapSize: Point
  paddleSize: Point
  playerXOffset: number
  ballSize: Point
  winScore: number
}
export const gameInfoConstants: GameInfoConstants = {
  mapSize: new Point(600, 400),
  paddleSize: new Point(6, 50),
  playerXOffset: 50,
  ballSize: new Point(20, 20),
  winScore: 9999
}

export interface GameUpdate {
  paddlesPositions: Point[]
  ballPosition: Point
  scores: number[]
}
