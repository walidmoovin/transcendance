import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Req,
  Res,
  StreamableFile,
  BadRequestException
} from '@nestjs/common'

import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'

import { type User } from './user.entity'
import { UsersService } from './users.service'
import { CreateUserDto, UpdateUserDto, AvatarUploadDto } from './user.dto'

import RequestWithUser from 'src/auth/requestWithUser.interface'
import { FtOauthGuard } from 'src/auth/42-auth.guard'
import { ApiBody, ApiConsumes } from '@nestjs/swagger'

import { Response } from 'express'
import { createReadStream } from 'fs'
import { join } from 'path'

@Controller('users')
export class UsersController {
  constructor (private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers (): Promise<User[]> {
    return await this.usersService.getAllUsers()
  }

  @Post()
  async create (@Body() payload: CreateUserDto) {
    return await this.usersService.create(payload)
  }

  @Post(':id')
  update (@Param('id', ParseIntPipe) id: number, @Body() user: UpdateUserDto) {
    this.usersService.update(id, user)
  }

  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: 'avatars/'
      }),
      fileFilter: (request: Request, file: Express.Multer.File, callback) => {
        if (!file.mimetype.includes('image')) {
          callback(new BadRequestException('Provide a valid image'), false)
          return
        }
        callback(null, true)
      }
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'A new avatar for the user',
    type: AvatarUploadDto
  })
  async addAvatar (
  @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    await this.usersService.addAvatar(id, file.filename)
  }

  @Get(':id/avatar')
  async getAvatar (
  @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) response: Response
  ) {
    const user = await this.usersService.findOne(id)
    const filename = user.avatar
    const stream = createReadStream(join(process.cwd(), 'avatars/' + filename))
    response.set({
      'Content-Diposition': `inline; filename="${filename}"`,
      'Content-Type': 'image/jpg'
    })
    return new StreamableFile(stream)
  }
}
