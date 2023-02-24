import { Module } from '@nestjs/common'

import { ApiModule } from './api/api.module'
import { AuthModule } from './auth/auth.module'
import { ChatModule } from './chat/chat.module'
import { DbModule } from './db/db.module'
import { PongModule } from './pong/pong.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ApiModule,
    AuthModule,
    ChatModule,
    DbModule,
    PongModule,
    UsersModule
  ],
})
export class AppModule { }
