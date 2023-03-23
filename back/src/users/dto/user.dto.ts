import { IsNotEmpty, IsPositive, IsOptional, IsEmail, NotContains, MaxLength, IsAlphanumeric } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'
import { Express } from 'express'

export class UserDto {
  @IsPositive()
  @IsOptional()
  readonly ftId: number

  @IsNotEmpty()
  @NotContains(' ')
  @IsAlphanumeric()
  @MaxLength(15)
  readonly username: string

  @IsEmail()
  @IsNotEmpty()
  readonly email: string

  @IsOptional()
  readonly status: string

  @IsOptional()
  readonly avatar: string

  @IsOptional()
  readonly authToken: string

  @IsOptional()
  readonly isVerified: boolean
}

export class AvatarUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
    file: Express.Multer.File
}
