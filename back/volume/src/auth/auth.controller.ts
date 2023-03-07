import { Controller, Get, Redirect, UseGuards, Res, Req } from '@nestjs/common'
import { Response, Request } from 'express'
import { Profile } from 'passport-42'

import { FtOauthGuard, AuthenticatedGuard } from './42-auth.guard'
import { FtUser } from './42.decorator'

@Controller('log')
export class AuthController {
  @Get('in')
  @UseGuards(FtOauthGuard)
  ftAuth (): void {}

  @Get('inReturn')
  @UseGuards(FtOauthGuard)
  @Redirect(`http://${process.env.HOST}:${process.env.FRONT_PORT}`)
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
  @Redirect(`http://${process.env.HOST}:${process.env.FRONT_PORT}`)
  logOut (@Req() req: Request): any {
    req.logOut(function (err) {
      if (err != null) return err
    })
  }
}
