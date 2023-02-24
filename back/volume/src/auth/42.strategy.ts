import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, Profile, VerifyCallback } from 'passport-42'
import { UsersService } from 'src/users/users.service'
import { User } from 'src/users/user.entity'

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, '42') {
  constructor (
    private readonly configService: ConfigService,
    private readonly usersService: UsersService
  ) {
    super({
      clientID: configService.get<string>('FT_OAUTH_CLIENT_ID'),
      clientSecret: configService.get<string>('FT_OAUTH_CLIENT_SECRET'),
      callbackURL: configService.get<string>('FT_OAUTH_CALLBACK_URL'),
      passReqToCallback: true
    })
  }

  async validate (
    request: { session: { accessToken: string } },
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    cb: VerifyCallback
  ): Promise<any> {
    request.session.accessToken = accessToken
    console.log('accessToken', accessToken, 'refreshToken', refreshToken)
    const id_42 = profile.id as number
    console.log(profile)
    if ((await this.usersService.getOneUser42(id_42)) === null) {
      const newUser = new User()
      newUser.id_42 = profile.id as number
      newUser.username = profile.displayName as string
      newUser.avatar = profile._json.image.versions.small as string
      this.usersService.create(newUser)
    }
    return cb(null, profile)
  }
}
