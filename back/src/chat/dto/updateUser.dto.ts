import { Type } from 'class-transformer'
import { IsArray, IsEmail, IsNumber, IsPositive, IsString } from 'class-validator'

export class IdDto {
  @IsNumber()
    id: number
}

export class PasswordDto {
  @IsString()
    password: string
}

export class MuteDto {
  @Type(() => Number)
  @IsArray()
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
    data: number[]
}

export class EmailDto {
  @IsEmail()
    email: string
}
