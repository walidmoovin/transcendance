import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ScheduleModule } from '@nestjs/schedule'

import { AuthModule } from './auth/auth.module'
import { ChatModule } from './chat/chat.module'
import { PongModule } from './pong/pong.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: (process.env.POSTGRES_PORT || 5432) as number,
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'postgres',
        database: process.env.POSTGRES_DB || 'postgres',
        jwt_secret: process.env.JWT_SECRET || 'secret',
        autoLoadEntities: true,
        synchronize: true
      })
    }),
    AuthModule,
    ChatModule,
    PongModule,
    UsersModule
  ]
})
export class AppModule {}
