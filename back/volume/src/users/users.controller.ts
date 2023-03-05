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
  BadRequestException,
  Redirect
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

  @Get('friends')
  @UseGuards(AuthenticatedGuard)
  async getFriends (@FtUser() profile: Profile) {
    return await this.usersService.getFriends(profile.id)
  }

  @Get('invits')
  @UseGuards(AuthenticatedGuard)
  async getInvits (@FtUser() profile: Profile) {
    return await this.usersService.getInvits(profile.id)
  }

  @Post('avatar')
  @UseGuards(AuthenticatedGuard)
  @Redirect('http://localhost')
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
  @FtUser() profile: Profile,
    @UploadedFile() file: Express.Multer.File
  ) {
    await this.usersService.addAvatar(profile.id, file.filename)
  }

  @Get('avatar')
  @UseGuards(AuthenticatedGuard)
  async getAvatar (
  @FtUser() profile: Profile,
    @Res({ passthrough: true }) response: Response
  ) {
    return await this.getAvatarById(profile.id, response)
  }

  @Get('user/:name')
  async getUserByName (@Param('name') username: string): Promise<User | null> {
    return await this.usersService.findUserByName(username)
  }

  @Get('invit/:id')
  @UseGuards(AuthenticatedGuard)
  async invitUser (
  @FtUser() profile: Profile,
    @Param('id', ParseIntPipe) id: number
  ) {
    return await this.usersService.invit(profile.id, id)
  }

  @Get('avatar/:id')
  async getAvatarById (
  @Param('id', ParseIntPipe) ftId: number,
    @Res({ passthrough: true }) response: Response
  ) {
    const user = await this.usersService.findUser(ftId)
    if (user == null) return
    const filename = user.avatar
    const stream = createReadStream(join(process.cwd(), 'avatars/' + filename))
    response.set({
      'Content-Diposition': `inline; filename="${filename}"`,
      'Content-Type': 'image/jpg'
    })
    return new StreamableFile(stream)
  }

  @Get(':id')
  async getUserById (
    @Param('id', ParseIntPipe) ftId: number
  ): Promise<User | null> {
    return await this.usersService.findUser(ftId)
  }

  @Get()
  @UseGuards(AuthenticatedGuard)
  async getUser (@FtUser() profile: Profile): Promise<User | null> {
    return await this.usersService.findUser(profile.id)
  }

  @Post()
  @UseGuards(AuthenticatedGuard)
  async create (@Body() payload: UserDto, @FtUser() profile: Profile) {
    const user = await this.usersService.findUser(profile.id)
    if (user != null) {
      return await this.usersService.update(user, payload)
    } else {
      return await this.usersService.create(payload)
    }
  }
}
