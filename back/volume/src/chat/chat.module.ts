import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from 'src/auth/auth.module'
import { UsersModule } from 'src/users/users.module'
// import { ChatGateway } from './chat.gateway'
import { ChatController } from './chat.controller'
import { ChannelService } from './chat.service'

import Channel from './entity/channel.entity'
import Message from './entity/message.entity'

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TypeOrmModule.forFeature([Channel]),
    TypeOrmModule.forFeature([Message])
  ],
  controllers: [ChatController],
  providers: [ChannelService]
})
export class ChatModule {}
