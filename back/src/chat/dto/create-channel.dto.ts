import { Transform } from 'class-transformer'
import {
  IsPositive,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean
} from 'class-validator'

export class CreateChannelDto {
  @IsString()
    name: string

  @IsNumber()
    owner: number

  @IsOptional()
    password: string

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
    isPrivate: boolean

  @IsBoolean()
  @IsOptional()
    isDM: boolean

  @IsString()
  @IsOptional()
    otherDMedUsername: string
}
