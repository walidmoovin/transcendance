import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from 'src/auth/auth.module'
import { UsersModule } from 'src/users/users.module'
import { ChatGateway } from './chat.gateway'
import { ChatService } from './chat.service'
import { Channel } from './entity/channel.entity'
import { Message } from './entity/message.entity'

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TypeOrmModule.forFeature([Channel]),
    TypeOrmModule.forFeature([Message])
  ],
  providers: [ChatGateway, ChatService]
})
export class ChatModule {}
