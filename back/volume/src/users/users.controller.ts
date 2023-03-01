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
import { UserDto, AvatarUploadDto } from './user.dto'

import { AuthenticatedGuard } from 'src/auth/42-auth.guard'
import { FtUser } from 'src/auth/42.decorator'
import { Profile } from 'passport-42'

import { ApiBody, ApiConsumes } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { createReadStream } from 'fs'
import { join } from 'path'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async getAllUsers(): Promise<User[]> {
    return await this.usersService.getAllUsers()
  }

  @Post()
  @UseGuards(AuthenticatedGuard)
  async create(
    @Body() payload: UserDto,
    @FtUser() profile: Profile) {
    const user = await this.usersService.getOneUser42(profile.id);
    if (user) {
      return await this.usersService.update(user.id, payload)
    } else {
      return await this.usersService.create(payload)
    }
  }

  @Post("follow/:target")
  @UseGuards(AuthenticatedGuard)
  followUser(
    @FtUser() profile: Profile,
    @Param('target, ParseIntPipe') target: number,
  ) {
    this.usersService.follow(profile.id, target);
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
  async addAvatar(
    @FtUser() profile: Profile,
    @UploadedFile() file: Express.Multer.File
  ) {
    await this.usersService.addAvatar(profile.id, file.filename)
  }

  @Get('avatar')
  async getAvatar(
    @FtUser() profile: Profile,
    @Res({ passthrough: true }) response: Response
  ) {
    const user = await this.usersService.getOneUser42(profile.id)
    const filename = user.avatar
    const stream = createReadStream(join(process.cwd(), 'avatars/' + filename))
    response.set({
      'Content-Diposition': `inline; filename="${filename}"`,
      'Content-Type': 'image/jpg'
    })
    return new StreamableFile(stream)
  }
}
