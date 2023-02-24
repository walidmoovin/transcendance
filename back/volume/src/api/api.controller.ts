import { Controller, Get, Redirect, Req, UseGuards } from '@nestjs/common'
import { User } from 'src/auth/42.decorator'
import { AuthenticatedGuard } from 'src/auth/42-auth.guard'
import { Profile } from 'passport-42'
import { Request } from 'express'

@Controller()
export class ApiController {
  @Get('profile')
  @UseGuards(AuthenticatedGuard)
  profile (@User() user: Profile) {
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

