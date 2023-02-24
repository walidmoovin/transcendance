import { Module } from '@nestjs/common'
import { UsersModule } from 'src/users/users.module'
import { PassportModule } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import { AuthController } from './auth.controller'
import { FtStrategy } from './42.strategy'
import { SessionSerializer } from './session.serializer'

@Module({
  imports: [UsersModule, PassportModule],
  providers: [ConfigService, FtStrategy, SessionSerializer],
  controllers: [AuthController]
})
export class AuthModule {}
