import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Channel } from './model/channel.entity';
import { Message } from './model/message.entity';

import { CreateChannelDto } from './model/create-channel.dto'

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:5000',
      'http://localhost:80',
      'http://localhost:8080',
    ],
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private userService: UsersService,
    private chatservice: ChatService,
  ) { }

  async handleConnection(socket: Socket) {
    try {
      const user: User = await this.userService.findOne(socket.data.user.id);
      if (!user) {
        socket.emit('Error', new UnauthorizedException());
        socket.disconnect();
        return;
      } else {
        socket.data.user = user;
        const channels = await this.chatservice.getChannelsForUser(user.id);
        // Only emit rooms to the specific connected client
        return this.server.to(socket.id).emit('channel', channels);
      }
    } catch {
      socket.emit('Error', new UnauthorizedException());
      socket.disconnect();
      return;
    }
  }

  handleDisconnect(socket: Socket) {
    socket.disconnect();
  }

  async onCreateChannel(socket: Socket, channel: CreateChannelDto): Promise<Channel> {
    return this.chatservice.createChannel(channel, socket.data.user);
  }

  @SubscribeMessage('joinChannel')
  async onJoinChannel(socket: Socket, channel: Channel) {
    //add user to channel
    const messages = await this.chatservice.findMessagesInChannelForUser(
      channel,
      socket.data.user,
    );
    this.server.to(socket.id).emit('messages', messages);
  }

  @SubscribeMessage('leaveChannel')
  async onLeaveChannel(socket: Socket) {
    await this.chatservice.deleteBySocketId(socket.id);
  }

  @SubscribeMessage('addMessage')
  async onAddMessage(socket: Socket, message: Message) {
    const createdMessage: Message = await this.chatservice.createMessage({
      ...message,
      author: socket.data.user,
    });
    const channel = await this.chatservice.getChannel(
      createdMessage.channel.id,
    );
    //send new Message to all joined Users currently online of the channel
  }
}
