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
import { kickUserDto } from './dto/kickUser.dto'
import ConnectedUser from './entity/connection.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { connect } from 'http2'
import User from 'src/users/entity/user.entity'

@WebSocketGateway({
  cors: {
    origin: new RegExp(
      `^(http|ws)://${process.env.HOST ?? 'localhost'}(:\\d+)?$`
    )
  }
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
    if (channel.banned.findIndex((ban) => ban[0] === connect.UserId) !== -1) {
      throw new WsException('You are banned from entering this channel')
    }
    const user = await this.userService.getFullUser(connect.UserId)
    if (channel.password && channel.password !== '') {
      if (
        !connect.pwd ||
        !(await bcrypt.compare(connect.pwd, channel.password))
      ) {
        throw new WsException('Wrong password')
      }
    } else await this.chatService.addUserToChannel(channel, user)
    const messages = await this.messageService.findMessagesInChannelForUser(
      channel,
      user
    )
	const conUser = {
		user : user.id,
		channel : channel.id,
		socket: socket.id	
	}
	this.connectedUserRepository.create(conUser)
    this.server.to(socket.id).emit('messages', messages)
    await socket.join(channel.id.toString())
  }

  @SubscribeMessage('getMessages')
  async onGetMessages (socket: Socket, connect: ConnectionDto): Promise<void> {
    const user = await this.userService.getFullUser(connect.UserId)
    const channel = await this.chatService.getFullChannel(connect.ChannelId)
    const messages = await this.messageService.findMessagesInChannelForUser(
      channel,
      user
    )
    this.server.to(socket.id).emit('messages', messages)
  }

  @SubscribeMessage('leaveChannel')
  async onLeaveChannel (socket: Socket): Promise<void> {
	const connect = await this.connectedUserRepository.findOneBy({socket : socket.id})
	if (connect == null)
		return
	const channel = await this.chatService.getFullChannel(connect.channel)
	socket.disconnect()
	if (connect.user == channel.owner.id) {
		this.server.in(channel.id.toString()).disconnectSockets()
		this.chatService.removeChannel(channel.id)
	} else {
		channel.users = channel.users.filter((e) => e.id !== connect.user)
	}
	await this.connectedUserRepository.delete({ socket : socket.id })
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
  async onKickUser (socket: Socket, kick: kickUserDto): Promise<void> {
	const channel = await this.chatService.getFullChannel(kick.chan); 
	if (channel.owner.id == kick.to)
		throw new WsException('You cannot kick the owner of a channel')
	if (
		channel.owner.id !== kick.from &&
		channel.admins.findIndex((usr) => usr.id === kick.from) === -1
	  ) {
		throw new WsException('You do not have the required privileges')
	  }
	const user = await this.userService.findUser(kick.to) as User
	const connect = await this.connectedUserRepository.findOneBy({user : user.id}) as ConnectedUser
    await this.onLeaveChannel(socket)
	this.server.sockets.sockets.get(connect.socket)?.disconnect()
  }
}
