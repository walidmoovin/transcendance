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
  Res,
  StreamableFile,
  BadRequestException
} from '@nestjs/common'

import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'

import { type User } from './entity/user.entity'
import { UsersService } from './users.service'
import { UserDto, AvatarUploadDto } from './dto/user.dto'

import { AuthenticatedGuard } from 'src/auth/42-auth.guard'
import { FtUser } from 'src/auth/42.decorator'
import { Profile } from 'passport-42'

import { ApiBody, ApiConsumes } from '@nestjs/swagger'
import { type Request, Response } from 'express'
import { createReadStream } from 'fs'
import { join } from 'path'

@Controller()
export class UsersController {
  constructor (private readonly usersService: UsersService) {}

  @Get('all')
  async getAllUsers (): Promise<User[]> {
    return await this.usersService.findUsers()
  }

  @Get('online')
  async getOnlineUsers (): Promise<User[]> {
    return await this.usersService.findOnlineUsers()
  }

  @Get(':id')
  async getUser (@Param('id', ParseIntPipe) ftId: number): Promise<User> {
    return await this.usersService.findUser(ftId)
  }

  @Post(':id')
  async create (
  @Body() payload: UserDto,
    @Param('id', ParseIntPipe) ftId: number
  ) {
    const user = await this.usersService.findUser(ftId)
    if (user) {
      return await this.usersService.update(user.id, payload)
    } else {
      return await this.usersService.create(payload)
    }
  }

  @Get(':id/friends')
  async getFriends (@Param('id', ParseIntPipe) ftId: number) {
    return await this.usersService.getFriends(ftId)
  }

  @Get(':id/invits')
  async getInvits (@Param('id', ParseIntPipe) ftId: number) {
    return await this.usersService.getInvits(ftId)
  }

  @Post(':id1/invit/:id2')
  async invitUser (
  @Param('id1', ParseIntPipe) ftId: number,
    @Param('id2', ParseIntPipe) targetId: number
  ) {
    return await this.usersService.invit(ftId, targetId)
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
  @Param('id', ParseIntPipe) ftId: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    return await this.usersService.addAvatar(ftId, file.filename)
  }

  @Get(':id/avatar')
  async getAvatar (
  @Param('id', ParseIntPipe) ftId: number,
    @Res({ passthrough: true }) response: Response
  ) {
    const user = await this.usersService.findUser(ftId)
    const filename = user.avatar
    const stream = createReadStream(join(process.cwd(), 'avatars/' + filename))
    response.set({
      'Content-Diposition': `inline; filename="${filename}"`,
      'Content-Type': 'image/jpg'
    })
    return new StreamableFile(stream)
  }
}
