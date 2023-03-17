import {
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException
} from '@nestjs/websockets'
import { Socket, Server } from 'socket.io'
// import { User } from 'users/user.entity';
import { UsersService } from 'src/users/users.service'
import { ChatService } from './chat.service'
import type Message from './entity/message.entity'
import * as bcrypt from 'bcrypt'
import { MessageService } from './message.service'
import { CreateMessageDto } from './dto/create-message.dto'
import { ConnectionDto } from './dto/connection.dto'

@WebSocketGateway({
  cors: { origin: new RegExp(`^(http|ws)://${process.env.HOST ?? 'localhost'}(:\\d+)?$`) }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
    server: Server

  constructor (
    private readonly userService: UsersService,
    private readonly messageService: MessageService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection (socket: Socket): Promise<void> {}

  async handleDisconnect (socket: Socket): Promise<void> {
    await this.onLeaveChannel(socket)
    socket.disconnect()
  }

  @SubscribeMessage('joinChannel')
  async onJoinChannel (socket: Socket, connect: ConnectionDto): Promise<void> {
    console.log(
      'User %s is trying to join channel %s',
      connect.UserId,
      connect.ChannelId,
      connect.pwd
    )
    const channel = await this.chatService.getFullChannel(connect.ChannelId)
    console.log('1')
    if (channel.banned.findIndex((ban) => ban.ftId === connect.UserId) !== -1) {
      throw new WsException('You are banned from entering this channel')
    }
    console.log('2')
    const user = await this.userService.getFullUser(connect.UserId)
    console.log('3')
    console.log('Channel psw: ', channel.password)
    if (channel.password && channel.password !== '') {
      if (
        !connect.pwd ||
        !(await bcrypt.compare(connect.pwd, channel.password))
      ) {
        throw new WsException('Wrong password')
      }
    } else await this.chatService.addUserToChannel(channel, user)
    console.log('5')
    console.log('8')
    const messages = await this.messageService.findMessagesInChannelForUser(
      channel,
      user
    )
    console.log('9')
    this.server.to(socket.id).emit('messages', messages)
    console.log('10')
    await socket.join(channel.id.toString())
  }

  @SubscribeMessage('leaveChannel')
  async onLeaveChannel (socket: Socket): Promise<void> {
    const id = socket.id as any
  }

  @SubscribeMessage('addMessage')
  async onAddMessage (socket: Socket, message: CreateMessageDto): Promise<void> {
    const channel = await this.chatService.getChannel(message.ChannelId)
    if (
      (await this.chatService.getMuteDuration(channel.id, message.UserId)) > 0
    ) {
      throw new WsException('You are muted')
    }
    const createdMessage: Message = await this.messageService.createMessage(
      message
    )
    this.server.to(channel.id.toString()).emit('newMessage', createdMessage)
  }

  @SubscribeMessage('kickUser')
  async onKickUser (
    socket: Socket,
    chan: number,
    from: number,
    to: number
  ): Promise<void> {
    const channel = await this.chatService.getChannel(chan)
    if (
      channel.owner.id !== from ||
      channel.admins.find((e) => e.id === from) == null
    ) {
      throw new WsException('You do not have the required privileges')
    }
    await this.onLeaveChannel(socket)
  }
}
