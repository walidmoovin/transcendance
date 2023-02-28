import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'

import { ApiModule } from './api/api.module'
import { AuthModule } from './auth/auth.module'
import { ChatModule } from './chat/chat.module'
import { DbModule } from './db/db.module'
import { PongModule } from './pong/pong.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        BACK_PORT: Joi.number(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required()
      })
    }),
    ApiModule,
    AuthModule,
    ChatModule,
    DbModule,
    PongModule,
    UsersModule
  ]
})
export class AppModule {}
