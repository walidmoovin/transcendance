import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsNotEmptyObject,
  IsString,
  ValidateNested
} from 'class-validator'
import { MapDtoValidated } from './MapDtoValidated'

export class GameCreationDtoValidated {
  @IsString({ each: true })
  @ArrayMaxSize(2)
  @ArrayMinSize(2)
    playerNames!: string[]

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => MapDtoValidated)
    map!: MapDtoValidated
}
