import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { type User } from 'src/users/entity/user.entity'
import { Channel } from './entity/channel.entity'
import { Message } from './entity/message.entity'

@Injectable()
export class ChatService {
  constructor (
    @InjectRepository(Channel)
    private readonly ChannelRepository: Repository<Channel>,
    @InjectRepository(Message)
    private readonly MessageRepository: Repository<Message>
  ) {}

  async createChannel (Channel: Channel, creator: User): Promise<Channel> {
    const newChannel = await this.addCreatorToChannel(Channel, creator)
    return await this.ChannelRepository.save(newChannel)
  }

  async getChannelsForUser (userId: number): Promise<Channel[]> {
    return await this.ChannelRepository.find({}) // where userId is in User[] of channel?
  }

  async addCreatorToChannel (Channel: Channel, creator: User): Promise<Channel> {
    Channel.users.push(creator)
    return Channel
  }

  async createMessage (message: Message): Promise<Message> {
    return await this.MessageRepository.save(
      this.MessageRepository.create(message)
    )
  }

  async deleteBySocketId (socketId: string) {
    return await this.ChannelRepository.delete({}) // for disconnect
  }

  async getChannel (id: number): Promise<Channel | null> {
    return await this.ChannelRepository.findOneBy({ id })
  }

  async findMessagesInChannelForUser (
    channel: Channel,
    user: User
  ): Promise<Message[]> {
    return await this.MessageRepository.createQueryBuilder('message')
      .where('message.channel = :chan', { chan: channel })
      .andWhere('message.author NOT IN (:...blocked)', {
        blocked: user.blocked
      })
      .getMany()
  }
}
