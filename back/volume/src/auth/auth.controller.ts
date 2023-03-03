import { Controller, Get, Redirect, UseGuards, Res, Req } from '@nestjs/common'
import { Response, Request } from 'express'
import { Profile } from 'passport-42'

import { FtOauthGuard, AuthenticatedGuard } from './42-auth.guard'
import { FtUser } from './42.decorator'

@Controller('log')
export class AuthController {
  @Get('in')
  @UseGuards(FtOauthGuard)
  ftAuth () {}

  @Get('inReturn')
  @UseGuards(FtOauthGuard)
  @Redirect('http://' + process.env.HOST + ':' + process.env.FRONT_PORT + '/')
  ftAuthCallback (
  @Res({ passthrough: true }) response: Response,
    @Req() request: Request
  ) {
    console.log('cookie:', request.cookies['connect.sid'])
    response.cookie('connect.sid', request.cookies['connect.sid'])
  }

  @Get('profile')
  @UseGuards(AuthenticatedGuard)
  profile (@FtUser() user: Profile) {
    return { user }
  }

  @Get('out')
  @Redirect('/')
  logOut (@Req() req: Request) {
    req.logOut(function (err) {
      if (err) return err
    })
  }
}
