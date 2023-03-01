import { Controller, Get, Redirect, Req, UseGuards } from '@nestjs/common'
import { Request } from 'express'
import { Profile } from 'passport-42'
import { FtUser } from './auth/42.decorator'
import { AuthenticatedGuard } from './auth/42-auth.guard'

@Controller()
export class AppController {
  @Get('profile')
  @UseGuards(AuthenticatedGuard)
  profile (@FtUser() user: Profile) {
    return { user }
  }

  @Get('logout')
  @Redirect('/')
  logOut (@Req() req: Request) {
    req.logOut(function (err) {
      if (err) return err
    })
  }

  @Get('ranks')
  getRanks (): number[] {
    return [1, 2, 3]
  }
}
