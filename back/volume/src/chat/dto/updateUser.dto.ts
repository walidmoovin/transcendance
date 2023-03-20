import { IsEmail, isNumber, IsNumber, IsString } from 'class-validator'

export class IdDto {
  @IsNumber()
    id: number
}

export class PasswordDto {
  @IsString()
    password: string
}

export class MuteDto {
  @IsNumber()
    userId: number

  @IsNumber()
    duration: number
}

export class EmailDto {
  @IsEmail()
    email: string
}
