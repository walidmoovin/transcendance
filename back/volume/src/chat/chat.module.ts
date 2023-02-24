import { Module, forwardRef } from '@nestjs/common'

import { TypeOrmModule } from '@nestjs/typeorm'
import { Message } from './entities/message.entity'
import { Channel } from './entities/channel.entity'
import { UsersModule } from 'src/users/users.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, Message]),
    forwardRef(() => UsersModule)
  ]
  // providers: [ChatService]
})
export class ChatModule {}
