import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'

import { Channel } from 'src/chat/model/channel.entity';
import { User } from 'src/users/user.entity';
import { Message } from './model/message.entity';
import { CreateChannelDto } from './model/create-channel.dto'

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Channel)
    private readonly ChannelRepository: Repository<Channel>,
    @InjectRepository(Message)
    private readonly MessageRepository: Repository<Message>,
  ) { }

  async createChannel(channelDatas: CreateChannelDto, creator: User): Promise<Channel> {
    channelDatas.password = await bcrypt.hash(channelDatas.password, 10);
    const newChannel = this.ChannelRepository.create(channelDatas);
    await this.addCreatorToChannel(newChannel, creator);
    this.ChannelRepository.save(newChannel);
    newChannel.password = undefined;
    return newChannel;
  }

  async getChannelsForUser(userId: number): Promise<Channel[]> {
    return this.ChannelRepository.find({}); //where userId is in User[] of channel?
  }

  async addCreatorToChannel(Channel: Channel, creator: User): Promise<Channel> {
    Channel.users.push(creator);
    return Channel;
  }

  async createMessage(message: Message): Promise<Message> {
    return this.MessageRepository.save(this.MessageRepository.create(message));
  }

  async deleteBySocketId(socketId: string) {
    return this.ChannelRepository.delete({}); // for disconnect
  }

  async getChannel(id: number): Promise<Channel | null> {
    return this.ChannelRepository.findOneBy({ id });
  }

  async findMessagesInChannelForUser(
    channel: Channel,
    user: User,
  ): Promise<Message> {
    return this.MessageRepository.findOne({
      where: {
        channel: { id: channel.id }
      },
      relations: { channel: true },
    })
  }
}
