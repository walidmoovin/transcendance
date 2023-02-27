import { Controller, Get, Redirect, UseGuards, Res, Req } from '@nestjs/common'
import { FtOauthGuard } from './42-auth.guard'
import { Response, Request } from 'express'

@Controller('auth')
export class AuthController {
  @Get('42')
  @UseGuards(FtOauthGuard)
  ftAuth () {}

  @Get('42/return')
  @UseGuards(FtOauthGuard)
  @Redirect('http://localhost:80/')
  ftAuthCallback (
  @Res({ passthrough: true }) response: Response,
    @Req() request: Request
  ) {
    console.log('cookie:', request.cookies['connect.sid'])
    response.cookie('connect.sid', request.cookies['connect.sid'])
  }
}
