import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './entity/channel.entity';
import { User } from 'src/users/entity/user.entity';
import { Repository } from 'typeorm';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private readonly ChannelRepository: Repository<Channel>,
    private readonly usersService: UsersService,
  ) {}

  async createChannel(channel: CreateChannelDto): Promise<Channel> {
    const newChannel = this.ChannelRepository.create({
      name: channel.name,
      password: channel.password,
    });
    let user: User| null = await this.usersService.findUser(channel.owner);
    if (user == null) throw new NotFoundException(`User #${channel.owner} not found`)
    newChannel.owner = user;
    return await this.ChannelRepository.save(newChannel);
  }

  async getChannelsForUser(ftId: number): Promise<Array<Channel>> {
    const query = await this.ChannelRepository.createQueryBuilder('room')
      .innerJoin('room.users', 'users')
      .where('users.ftId = :ftId', { ftId })
      .leftJoinAndSelect('room.users', 'all_users')
      .orderBy('room.id', 'DESC') // TODO: order by last message
      .getRawMany();
    return query; //where userId is in User[] of channel?
  }

  async addUserToChannel(channel: Channel, user: User): Promise<Channel> {
    channel.owner = user;
    return await this.ChannelRepository.save(channel);
  }

  async getChannel(id: number): Promise<Channel> {
    const channel = await this.ChannelRepository.findOneBy({ id });
    if (!channel) throw new NotFoundException(`Channel #${id} not found`);
    return channel;
  }

  async update(channel: Channel) {
    this.ChannelRepository.update(channel.id, channel);
  }
  async removeChannel(id: number) {
    await this.ChannelRepository.delete(id);
  }
}

