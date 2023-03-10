export class Point {
  x: number
  y: number

  constructor (x: number, y: number) {
    this.x = x
    this.y = y
  }

  // Returns a new point
  add (other: Point): Point {
    return new Point(this.x + other.x, this.y + other.y)
  }

  // Modifies `this` point
  add_inplace (other: Point): void {
    this.x += other.x
    this.y += other.y
  }

  clone (): Point {
    return new Point(this.x, this.y)
  }
}

export class Rect {
  center: Point
  size: Point

  constructor (center: Point, size: Point) {
    this.center = center
    this.size = size
  }

  draw (
    context: CanvasRenderingContext2D,
    color: string | CanvasGradient | CanvasPattern
  ): void {
    const offset: Point = new Point(this.size.x / 2, this.size.y / 2)

    context.fillStyle = color
    context.fillRect(
      this.center.x - offset.x,
      this.center.y - offset.y,
      this.size.x,
      this.size.y
    )
  }

  // True if `this` rect contains `other` rect in the x-axis
  contains_x (other: Rect): boolean {
    const offset: number = this.size.x / 2
    const offsetOther: number = other.size.x / 2

    if (
      this.center.x - offset <= other.center.x - offsetOther &&
      this.center.x + offset >= other.center.x + offsetOther
    ) {
      return true
    }
    return false
  }

  // True if `this` rect contains `other` rect in the y-axis
  contains_y (other: Rect): boolean {
    const offset: number = this.size.y / 2
    const offsetOther: number = other.size.y / 2

    if (
      this.center.y - offset <= other.center.y - offsetOther &&
      this.center.y + offset >= other.center.y + offsetOther
    ) {
      return true
    }
    return false
  }

  collides (other: Rect): boolean {
    const offset: Point = new Point(this.size.x / 2, this.size.y / 2)
    const offsetOther: Point = new Point(other.size.x / 2, other.size.y / 2)

    if (
      this.center.x - offset.x < other.center.x + offsetOther.x &&
      this.center.x + offset.x > other.center.x - offsetOther.x &&
      this.center.y - offset.y < other.center.y + offsetOther.y &&
      this.center.y + offset.y > other.center.y - offsetOther.y
    ) {
      return true
    }
    return false
  }
}
