import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsEmail,
  Length,
  IsPositive,
  IsOptional
} from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'
import { Express } from 'express'

export class CreateUserDto {
  @IsPositive()
  @IsNotEmpty()
  readonly id_42: number

  @IsString()
  @IsNotEmpty()
  readonly username: string
}

export class UpdateUserDto {
  @IsPositive()
  @IsNotEmpty()
  readonly id_42: number

  @IsString()
  @IsNotEmpty()
  readonly username: string

  @IsOptional()
  readonly status: string
}

export class AvatarUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
    file: Express.Multer.File
}
