import {
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Socket, Server } from 'socket.io'
import { type User } from 'src/users/user.entity'
import { UsersService } from 'src/users/users.service'
import { UnauthorizedException } from '@nestjs/common'
import { ChatService } from './chat.service'
import { Channel } from './model/channel.entity'
import { Message } from './model/message.entity'

import { CreateChannelDto } from './model/create-channel.dto'

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:5000',
      'http://localhost:80',
      'http://localhost:8080'
    ]
  }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
    server: Server

  constructor (
    private readonly userService: UsersService,
    private readonly chatService: ChatService
  ) {}

  async handleConnection (socket: Socket) {
    try {
      const user: User = await this.userService.findOne(socket.data.user.id)
      if (!user) {
        socket.emit('Error', new UnauthorizedException())
        // socket.disconnect();
        return
      } else {
        socket.data.user = user
        const channels = await this.chatService.getChannelsForUser(user.id)
        // Only emit rooms to the specific connected client
        return this.server.to(socket.id).emit('channel', channels)
      }
    } catch {
      socket.emit('Error', new UnauthorizedException())
      // socket.disconnect();
    }
  }

  handleDisconnect (socket: Socket) {
    // socket.disconnect();
  }

  @SubscribeMessage('createChannel')
  async onCreateChannel (
    socket: Socket,
    @MessageBody() channeldto: CreateChannelDto
  ): Promise<Channel> {
    const channel = new Channel()
    channel.name = channeldto.name
    const owner = await this.userService.findOne(channeldto.owner)
    channel.owners.push(owner)
    channel.password = channeldto.password
    /// ...///
    return await this.chatService.createChannel(channel, socket.data.user)
  }

  @SubscribeMessage('joinChannel')
  async onJoinChannel (socket: Socket, channel: Channel) {
    // add user to channel
    const messages = await this.chatService.findMessagesInChannelForUser(
      channel,
      socket.data.user
    )
    this.server.to(socket.id).emit('messages', messages)
  }

  @SubscribeMessage('leaveChannel')
  async onLeaveChannel (socket: Socket) {
    await this.chatService.deleteBySocketId(socket.id)
  }

  @SubscribeMessage('addMessage')
  async onAddMessage (socket: Socket, message: Message) {
    const createdMessage: Message = await this.chatService.createMessage({
      ...message,
      author: socket.data.user
    })
    const channel = await this.chatService.getChannel(
      createdMessage.channel.id
    )
    const users = await this.userService.findOnlineInChannel(channel)
    /// TODO:  Send message to users
  }
}
