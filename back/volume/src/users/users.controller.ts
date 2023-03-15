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
import { PongService } from 'src/pong/pong.service'

import { AuthenticatedGuard } from 'src/auth/42-auth.guard'
import { Profile42 } from 'src/auth/42.decorator'
import { Profile } from 'passport-42'

import { ApiBody, ApiConsumes } from '@nestjs/swagger'
import { type Request, Response } from 'express'
import { createReadStream } from 'fs'
import { join } from 'path'

@Controller("users")
export class UsersController {
  constructor (
    private readonly usersService: UsersService,
  ) {}

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
  async getFriends (@Profile42() profile: Profile): Promise<User[]> {
    return await this.usersService.getFriends(profile.id)
  }

  @Get('invits')
  @UseGuards(AuthenticatedGuard)
  async getInvits (@Profile42() profile: Profile): Promise<User[]> {
    return await this.usersService.getInvits(profile.id)
  }

  @Get('leaderboard')
  @UseGuards(AuthenticatedGuard)
  async getLeaderboard (): Promise<User[]> {
    return await this.usersService.getLeaderboard()
  }

  @Get(':id/rank')
  @UseGuards(AuthenticatedGuard)
  async getRank (@Param('id', ParseIntPipe) id: number): Promise<number> {
    return await this.usersService.getRank(id)
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
          callback(null, false)
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
  async changeAvatar (
    @Profile42() profile: Profile,
      @UploadedFile() file: Express.Multer.File
  ): Promise<void> {
    if (file === undefined) return
    await this.usersService.addAvatar(profile.id, file.filename)
  }

  @Get('avatar')
  @UseGuards(AuthenticatedGuard)
  async getAvatar (
    @Profile42() profile: Profile,
      @Res({ passthrough: true }) response: Response
  ): Promise<StreamableFile> {
    return await this.getAvatarById(profile.id, response)
  }

  @Get(':name/byname')
  async getUserByName (@Param('name') username: string): Promise<User> {
    const user = await this.usersService.findUserByName(username)
    user.socketKey = ''
    return user
  }

  @Get('invit/:username')
  @UseGuards(AuthenticatedGuard)
  async invitUser (
      @Profile42() profile: Profile,
      @Param('username') username: string
  ): Promise<void> {
    const target: User | null = await this.usersService.findUserByName(
      username
    )
    if (target === null) {
      throw new BadRequestException(`User ${username} not found.`)
    }
    if (+profile.id === +target.ftId) {
      throw new BadRequestException("You can't invite yourself.")
    }
    const ret: string = await this.usersService.invit(profile.id, target.ftId)
    if (ret !== 'OK') throw new BadRequestException(ret)
  }

  @Get(':id/avatar')
  async getAvatarById (
    @Param('id', ParseIntPipe) ftId: number,
      @Res({ passthrough: true }) response: Response
  ): Promise<StreamableFile> {
    const user: User | null = await this.usersService.findUser(ftId)
    if (user === null) throw new BadRequestException('User unknown.')
    const filename = user.avatar
    const stream = createReadStream(join(process.cwd(), 'avatars/' + filename))
    response.set({
      'Content-Diposition': `inline; filename='${filename}'`,
      'Content-Type': 'image/jpg'
    })
    return new StreamableFile(stream)
  }

  @Get(':id')
  async getUserById (
    @Param('id', ParseIntPipe) ftId: number
  ): Promise<User | null> {
    const user = await this.usersService.findUser(ftId)
    if (user == null) throw new BadRequestException('User unknown.')
    user.socketKey = ''
    return user
  }

  @Post(':id')
  @UseGuards(AuthenticatedGuard)
  async createById (@Body() payload: UserDto): Promise<void> {
    const user = await this.usersService.findUser(payload.ftId)
    if (user != null) {
      await this.usersService.update(user, payload)
    } else {
      await this.usersService.create(payload)
    }
  }

  @Get()
  @UseGuards(AuthenticatedGuard)
  async getUser (@Profile42() profile: Profile): Promise<User | null> {
    return await this.usersService.findUser(profile.id)
  }

  @Post()
  @UseGuards(AuthenticatedGuard)
  async updateUser (
    @Body() payload: UserDto,
      @Profile42() profile: Profile
  ): Promise<BadRequestException | User | null> {
    const user = await this.usersService.findUser(profile.id)
    if (user == null) throw new BadRequestException('User not found.')
    return await this.usersService.update(user, payload)
  }
}
