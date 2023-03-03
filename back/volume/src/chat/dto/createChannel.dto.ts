import { IsPositive, IsAlpha, IsString, IsOptional } from 'class-validator'

export class CreateChannelDto {
  @IsString()
  @IsAlpha()
    name: string

  @IsPositive()
    owner: number

  @IsOptional()
    password: string
}
