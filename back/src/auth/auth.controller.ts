import {
  Controller,
  Get,
  Redirect,
  UseGuards,
  Res,
  Req,
  Post,
  Body,
  BadRequestException,
  Param
} from '@nestjs/common'
import { Response, Request } from 'express'

import { FtOauthGuard, AuthenticatedGuard } from './42-auth.guard'
import { Profile } from 'passport-42'
import { Profile42 } from './42.decorator'

import { AuthService } from './auth.service'
import { UsersService } from 'src/users/users.service'
import { EmailDto } from 'src/chat/dto/updateUser.dto'
import type User from 'src/users/entity/user.entity'

const frontHost =
  process.env.HOST !== undefined && process.env.HOST !== ''
    ? process.env.HOST
    : 'localhost'
const frontPort =
  process.env.PORT !== undefined && process.env.HOST !== ''
    ? process.env.PORT
    : '80'

@Controller('log')
export class AuthController {
  constructor (
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Get('in')
  @UseGuards(FtOauthGuard)
  ftAuth (): void {}

  @Get('inReturn')
  @UseGuards(FtOauthGuard)
  @Redirect(`http://${frontHost}:${frontPort}/profile`)
  ftAuthCallback (
    @Res({ passthrough: true }) response: Response,
      @Req() request: Request
  ): any {
    console.log('cookie:', request.cookies['connect.sid'])
    response.cookie('connect.sid', request.cookies['connect.sid'])
  }

  @Get('/verify')
  @UseGuards(AuthenticatedGuard)
  async VerifyEmail (@Profile42() profile: Profile): Promise<void> {
    const ftId: number = profile.id
    const user = await this.usersService.findUser(ftId)
    if (user == null) throw new BadRequestException('User not found')
    await this.authService.sendConfirmationEmail(user)
  }

  @Get('/verify/:code')
  @Redirect(`http://${frontHost}:${frontPort}`)
  async Verify (@Param("code") code: string): Promise<void> {
    await this.authService.verifyAccount(code)
  }

  @Get('profile')
  @UseGuards(AuthenticatedGuard)
  profile (@Profile42() user: Profile): any {
    return { user }
  }

  @Get('out')
  @Redirect(`http://${frontHost}:${frontPort}`)
  logOut (@Req() req: Request): any {
    req.logOut(function (err) {
      if (err != null) return err
    })
  }
}
