import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { type User } from 'src/users/entity/user.entity'
import { UsersService } from 'src/users/users.service'
import { MailerService } from '@nestjs-modules/mailer'
import { UserDto } from 'src/users/dto/user.dto'

@Injectable()
export class AuthService {
  constructor (
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService
  ) {}

  async sendConfirmedEmail (user: User) {
    const { email, username } = user
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to ft_transcendence! Email Confirmed',
      template: 'confirmed',
      context: {
        username,
        email
      }
    })
  }

  async sendConfirmationEmail (user: User) {
    user.authToken = Math.floor(10000 + Math.random() * 90000).toString()
    this.usersService.save(user)
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to ft_transcendence! Confirm Email',
      template: 'confirm',
      context: {
        username: user.username,
        code: user.authToken
      }
    })
  }

  async verifyAccount (code: string): Promise<boolean> {
    const user = await this.usersService.findByCode(code)
    if (!user) {
      throw new HttpException(
        'Verification code has expired or not found',
        HttpStatus.UNAUTHORIZED
      )
    }
    user.authToken = ''
    user.isVerified = true
    await this.usersService.save(user)
    await this.sendConfirmedEmail(user)
    return true
  }
}
