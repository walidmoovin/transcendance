import { Controller, Get, Redirect, UseGuards, Res, Req } from '@nestjs/common'
import { Response, Request } from 'express'
import { Profile } from 'passport-42'

import { FtOauthGuard, AuthenticatedGuard } from './42-auth.guard'
import { FtUser } from './42.decorator'

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
  @Get('in')
  @UseGuards(FtOauthGuard)
  ftAuth (): void {}

  @Get('inReturn')
  @UseGuards(FtOauthGuard)
  @Redirect(`http://${frontHost}:${frontPort}`)
  ftAuthCallback (
    @Res({ passthrough: true }) response: Response,
      @Req() request: Request
  ): any {
    console.log('cookie:', request.cookies['connect.sid'])
    response.cookie('connect.sid', request.cookies['connect.sid'])
  }

  @Get('profile')
  @UseGuards(AuthenticatedGuard)
  profile (@FtUser() user: Profile): any {
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
