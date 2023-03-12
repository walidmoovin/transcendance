import { UnauthorizedException, UseGuards } from '@nestjs/common'
import {
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Socket, Server } from 'socket.io'

import { ChatService } from './chat.service'
import { type User } from 'src/users/entity/user.entity'
import { UsersService } from 'src/users/users.service'
import { Channel } from './entity/channel.entity'
import { Message } from './entity/message.entity'

import { CreateChannelDto } from './dto/createChannel.dto'

@WebSocketGateway({
  cors: { origin: /^(http|ws):\/\/localhost(:\d+)?$/ }
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
      const user: User | null = await this.userService.findUser(
        socket.data.user.ftId
      )
      if (user == null) {
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
    // socket.disconnect()
  }

  @SubscribeMessage('createChannel')
  async onCreateChannel (
    socket: Socket,
    @MessageBody() channeldto: CreateChannelDto
  ): Promise<Channel | null> {
    const channel = new Channel()
    channel.name = channeldto.name
    // const owner = await this.userService.findUser(channeldto.owner)
    // if (owner == null) return null
    // channel.owners.push(owner)
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
    if (channel != null) {
      const users = await this.userService.findOnlineInChannel(channel)
    }
    /// TODO:  Send message to users
  }
}
