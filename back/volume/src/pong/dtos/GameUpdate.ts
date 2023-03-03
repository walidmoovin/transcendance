import { type Point } from '../game/utils'

export class GameUpdate {
  paddlesPositions!: Point[]
  ballPosition!: Point
  scores!: number[]
}
