import {
  IsString,
  IsNotEmpty,
  IsPositive,
  IsOptional
} from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'
import { Express } from 'express'

export class UserDto {
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
