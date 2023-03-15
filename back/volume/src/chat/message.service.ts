import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatService } from './chat.service';
import { UsersService } from 'src/users/users.service';

import { type CreateMessageDto } from './dto/create-message.dto';
import User from 'src/users/entity/user.entity';
import Channel from './entity/channel.entity';
import Message from './entity/message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly MessageRepository: Repository<Message>,
    private readonly channelService: ChatService,
    private readonly usersService: UsersService,
  ) {}

  async createMessage(message: CreateMessageDto): Promise<Message> {
    const msg = new Message();
    msg.text = message.text;
    msg.channel = await this.channelService.getChannel(message.ChannelId);
    msg.author = (await this.usersService.findUser(message.UserId)) as User;
    msg.channel.messages.push(msg);
    return await this.MessageRepository.save(
      this.MessageRepository.create(msg),
    );
  }

  async findMessagesInChannelForUser(
    channel: Channel,
    user: User,
  ): Promise<Message[]> {
    return await this.MessageRepository.createQueryBuilder('message')
      .where('message.channel = :chan', { chan: channel })
      .andWhere('message.author NOT IN (:...blocked)', {
        blocked: user.blocked,
      })
      .getMany();
  }
}
