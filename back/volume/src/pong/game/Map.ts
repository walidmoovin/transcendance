import { Type } from 'class-transformer'
import { ArrayMaxSize, IsArray, IsDefined, IsObject } from 'class-validator'
import { Point, Rect } from './utils'

export class Map {
  @IsObject()
  @IsDefined()
  @Type(() => Point)
    size!: Point

  @IsArray()
  @ArrayMaxSize(5)
  @Type(() => Rect)
    walls!: Rect[]
}
