import { gameInfoConstants } from './constants'
import { type Paddle } from './Paddle'
import { Point, Rect } from './utils'

export class Ball {
  rect: Rect
  speed: Point
  spawn: Point
  indexPlayerScored: number

  constructor (
    spawn: Point,
    size: Point = gameInfoConstants.ballSize,
    speed: Point = new Point(10, 2)
  ) {
    this.rect = new Rect(spawn, size)
    this.speed = speed
    this.spawn = spawn.clone()
    this.indexPlayerScored = -1
  }

  getIndexPlayerScored (): number {
    return this.indexPlayerScored
  }

  update (canvasRect: Rect, paddles: Paddle[]): void {
    if (!canvasRect.contains_x(this.rect)) {
      this.indexPlayerScored = this.score()
    } else {
      this.indexPlayerScored = -1
      this.move(canvasRect, paddles)
    }
  }

  move (canvasRect: Rect, paddles: Paddle[]): void {
    for (const paddle of paddles) {
      if (paddle.rect.collides(this.rect)) {
        if (this.speed.x < 0) {
          this.rect.center.x = paddle.rect.center.x + paddle.rect.size.x
        } else this.rect.center.x = paddle.rect.center.x - paddle.rect.size.x
        this.speed.x = this.speed.x * -1
        this.speed.y =
          ((this.rect.center.y - paddle.rect.center.y) / paddle.rect.size.y) *
          20
        break
      }
    }
    if (!canvasRect.contains_y(this.rect)) this.speed.y = this.speed.y * -1
    this.rect.center.add_inplace(this.speed)
  }

  // A player scored: return his index and reposition the ball
  score (): number {
    let indexPlayerScored: number
    if (this.rect.center.x <= this.spawn.x) {
      indexPlayerScored = 1
    } else {
      indexPlayerScored = 0
    }

    this.rect.center = this.spawn.clone()
    this.speed.x = this.speed.x * -1

    return indexPlayerScored
  }
}
