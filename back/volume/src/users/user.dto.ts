import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Length,
  IsPositive,
  IsOptional
} from 'class-validator'

export class CreateUserDto {
  @IsPositive()
  @IsNotEmpty()
  readonly id_42: number

  @IsString()
  @IsNotEmpty()
  readonly username: string

  @IsString()
  @IsNotEmpty()
  readonly avatar: string
}

export class UpdateUserDto {
  @IsPositive()
  @IsNotEmpty()
  readonly id_42: number

  @IsString()
  @IsNotEmpty()
  readonly username: string

  @IsString()
  @IsNotEmpty()
  readonly avatar: string

  @IsOptional()
  readonly status: string
}
