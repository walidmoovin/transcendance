import { ArrayMaxSize, ArrayMinSize, IsString } from 'class-validator'

export class PlayerNamesDto {
  @IsString({ each: true })
  @ArrayMaxSize(2)
  @ArrayMinSize(2)
    playerNames!: string[]
}
