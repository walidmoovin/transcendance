import {
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
// import { User } from 'users/user.entity';
import { UsersService } from 'src/users/users.service';
import { ChatService } from './chat.service';
import type Message from './entity/message.entity';
import * as bcrypt from 'bcrypt';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ConnectionDto } from './dto/connection.dto';
import { kickUserDto } from './dto/kickUser.dto';
import ConnectedUser from './entity/connection.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type User from 'src/users/entity/user.entity';
import Channel from './entity/channel.entity';

@WebSocketGateway({
  cors: {
    origin: new RegExp(
      `^(http|ws)://${process.env.HOST ?? 'localhost'}(:\\d+)?$`
    ),
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly userService: UsersService,
    private readonly messageService: MessageService,
    private readonly chatService: ChatService,
    @InjectRepository(ConnectedUser)
    private readonly connectedUserRepository: Repository<ConnectedUser>
  ) {}

  async handleConnection(socket: Socket): Promise<void> {}

  async handleDisconnect(socket: Socket): Promise<void> {
    const connect = await this.connectedUserRepository.findOneBy({
      socket: socket.id
    });
    if (connect) {
      console.log('socket %s has disconnected', socket.id)
      await this.connectedUserRepository.delete({ user: connect.user })
    }
  }

  @SubscribeMessage('joinChannel')
  async onJoinChannel(socket: Socket, connect: ConnectionDto): Promise<void> {
    await this.connectedUserRepository.delete({ user: connect.UserId })
    const channel = await this.chatService.getFullChannel(connect.ChannelId);
    if (channel.banned.some((ban) => +ban[0] === +connect.UserId)) {
      this.server
        .to(socket.id)
        .emit('failedJoin', 'You are banned from this channel');
      throw new WsException('You are banned from this channel');
    }
    const user = await this.userService.getFullUser(connect.UserId);
    if (connect.socketKey !== user.socketKey) {
      this.server.to(socket.id).emit('failedJoin', 'Wrong socket key');
      throw new WsException('Wrong socket key');
    }
    user.socketKey = '';
    if (channel.password && channel.password !== '') {
      if (
        !connect.pwd ||
        !(await bcrypt.compare(connect.pwd, channel.password))
      ) {
        this.server.to(socket.id).emit('failedJoin', 'Wrong password');
        throw new WsException('Wrong password');
      }
    }
    await this.chatService.addUserToChannel(channel, user);
    const messages = await this.messageService.findMessagesInChannelForUser(
      channel,
      user
    );
    const conUser = new ConnectedUser();
    conUser.user = user.ftId;
    conUser.channel = channel.id;
    conUser.socket = socket.id;
    await this.connectedUserRepository.save(conUser);
    await socket.join(channel.id.toString());
    this.server.to(socket.id).emit('messages', messages);
  }

  @SubscribeMessage('leaveChannel')
  async onLeaveChannel(socket: Socket): Promise<boolean> {
    const connect = await this.connectedUserRepository.findOneBy({
      socket: socket.id,
    });
    if (connect == null) return false;
    const channel = await this.chatService.getFullChannel(connect.channel);
    if (connect.user === channel.owner.ftId) {
      this.server.in(channel.id.toString()).emit('deleted');
      await this.chatService.removeChannel(channel.id);
    } else {
      channel.users = channel.users.filter((usr: User) => usr.ftId !== connect.user);
      channel.admins = channel.admins.filter((usr: User) => usr.ftId !== connect.user);
      await this.chatService.save(channel);
    }
    await this.connectedUserRepository.delete({ socket: socket.id });
    console.log('socket %s has left channel', socket.id)
    return true;
  }

  @SubscribeMessage('addMessage')
  async onAddMessage (socket: Socket, message: CreateMessageDto): Promise<void> {
    const connect = await this.connectedUserRepository.findOneBy({
      socket: socket.id,
    });
    if (connect == null) throw new WsException('You must be connected to the channel');
    let channel: Channel | null = null
    channel = await this.chatService.getChannel(message.ChannelId).catch(() => { return null })
    if (channel == null) {
      this.server.to(socket.id).emit('deleted')
      throw new WsException('Channel has been deleted');
    }
    if (await this.chatService.isMuted(channel.id, message.UserId)) {
      throw new WsException('You are muted');
    }
    const createdMessage: Message = await this.messageService.createMessage(
      message
    );
    this.server.to(channel.id.toString()).emit('newMessage', createdMessage);
  }

  @SubscribeMessage('kickUser')
  async onKickUser(socket: Socket, kick: kickUserDto): Promise<void> {
    let connect = (await this.connectedUserRepository.findOneBy({
      socket: socket.id
    }))
    if (connect === null) 
      throw new WsException('You must be connected to the channel')
    const channel = await this.chatService.getFullChannel(kick.chan);
    if (channel.owner.ftId === kick.to) {
      throw new WsException('You cannot kick the owner of a channel');
    }
    if (
      channel.owner.ftId !== kick.from &&
      !channel.admins.some((usr) => +usr.ftId === kick.from)
    ) {
      throw new WsException('You do not have the required privileges')
    }
    const target = (await this.userService.findUser(kick.to)) as User
    connect = (await this.connectedUserRepository.findOneBy({
      user: target.ftId
    }))
    if (connect !== null) {
      console.log(`kicking ${target.username} from ${channel.name} with socket ${connect.socket}`)
      this.server.to(connect.socket).emit('kicked')
    } else {
      throw new WsException('Target is not connected to the channel')
    }
  }
}
