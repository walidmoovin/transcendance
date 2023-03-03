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

  @Get()
  async getAllUsers (): Promise<User[]> {
    return await this.usersService.findUsers()
  }

  @Post()
  @UseGuards(AuthenticatedGuard)
  async create (@Body() payload: UserDto, @FtUser() profile: Profile) {
    const user = await this.usersService.findUser(profile.id)
    if (user) {
      return await this.usersService.update(user.id, payload)
    } else {
      return await this.usersService.create(payload)
    }
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

  @Post('invit/:id')
  @UseGuards(AuthenticatedGuard)
  async invitUser (
  @FtUser() profile: Profile,
    @Param('id', ParseIntPipe) id: number
  ) {
    return await this.usersService.invit(profile.id, id)
  }

  @Post('avatar')
  @UseGuards(AuthenticatedGuard)
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
    return await this.usersService.addAvatar(profile.id, file.filename)
  }

  @Get('avatar')
  async getAvatar (
  @FtUser() profile: Profile,
    @Res({ passthrough: true }) response: Response
  ) {
    const user = await this.usersService.findUser(profile.id)
    const filename = user.avatar
    const stream = createReadStream(join(process.cwd(), 'avatars/' + filename))
    response.set({
      'Content-Diposition': `inline; filename="${filename}"`,
      'Content-Type': 'image/jpg'
    })
    return new StreamableFile(stream)
  }
}
