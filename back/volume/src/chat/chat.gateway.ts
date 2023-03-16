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
import { type User } from 'src/users/entity/user.entity'
import { CreateMessageDto } from './dto/create-message.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import ConnectedUser from './entity/connection.entity'
import { ConnectionDto } from './dto/connection.dto'

@WebSocketGateway({
  cors: { origin: /^(http|ws):\/\/localhost(:\d+)?$/ }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
    server: Server

  constructor (
    private readonly userService: UsersService,
    private readonly messageService: MessageService,
    private readonly chatService: ChatService,
    @InjectRepository(ConnectedUser)
    private readonly connectedUserRepository: Repository<ConnectedUser>
  ) {}

  async handleConnection (socket: Socket): Promise<void> {}

  handleDisconnect (socket: Socket): void {
    socket.disconnect()
  }

  @SubscribeMessage('joinChannel')
  async onJoinChannel (socket: Socket, connect: ConnectionDto): Promise<void> {
    console.log(connect.ChannelId, connect.UserId, connect.pwd)
    const channel = await this.chatService.getFullChannel(connect.ChannelId)
    if (channel.banned.find((ban) => ban.id === connect.UserId) !== null) {
      throw new WsException('You are banned from entering this channel')
    }
    const user = (await this.userService.findUser(connect.UserId)) as User
    if ( channel.password !== '' &&
      !(await bcrypt.compare(channel.password, connect.pwd))
    ) {
      throw new WsException('Wrong password')
    } else await this.chatService.addUserToChannel(channel, user)

    {
      const conUser = new ConnectedUser()
      conUser.user = user
      conUser.channel = channel
      conUser.socket = socket.id
      await this.connectedUserRepository.save(conUser)
    }

    const messages = await this.messageService.findMessagesInChannelForUser(
      channel,
      user
    )
    this.server.to(socket.id).emit('messages', messages)
    await socket.join(channel.name)
  }

  @SubscribeMessage('leaveChannel')
  async onLeaveChannel (socket: Socket): Promise<void> {
    const id = socket.id as any
    await this.connectedUserRepository.delete({ socket: id })
    socket.disconnect()
  }

  @SubscribeMessage('addMessage')
  async onAddMessage (socket: Socket, message: CreateMessageDto): Promise<void> {
    console.log(JSON.stringify(message));
    const channel = await this.chatService.getChannel(message.ChannelId)
    if (
      (await this.chatService.getMuteDuration(channel.id, message.UserId)) > 0
    ) {
      throw new WsException('You are muted')
    }
    const createdMessage: Message = await this.messageService.createMessage(
      message
    )
    socket.in(channel.name).emit('newMessage', createdMessage)
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
