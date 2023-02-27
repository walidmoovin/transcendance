import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested
} from 'class-validator'
import { Map } from '../game/Map'

export class GameCreationDto {
  @IsString({ each: true })
  @ArrayMaxSize(2)
  @ArrayMinSize(2)
    playerNames!: string[]

  @IsDefined()
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Map)
    map!: Map
}
