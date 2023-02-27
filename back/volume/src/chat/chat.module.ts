import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { UsersService } from 'src/users/users.service';
import { Channel } from './model/channel.entity';
import { Message } from './model/message.entity';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TypeOrmModule.forFeature([Channel]),
    TypeOrmModule.forFeature([Message]),
  ],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
