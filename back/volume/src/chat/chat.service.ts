import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateChannelDto } from './dto/create-channel.dto';
import { UsersService } from 'src/users/users.service';

import User from 'src/users/entity/user.entity';
import Channel from './entity/channel.entity';
import { classToPlain, plainToClass } from 'class-transformer';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private readonly ChannelRepository: Repository<Channel>,
    private readonly usersService: UsersService,
  ) {}

  async createChannel(channel: CreateChannelDto): Promise<Channel> {
    let user: User| null = await this.usersService.findUser(channel.owner);
    if (user == null) throw new NotFoundException(`User #${channel.owner} not found`)
    const newChannel = plainToClass(Channel, channel);
    return await this.ChannelRepository.save(newChannel);
  }

  async getChannelsForUser(ftId: number): Promise<Array<Channel>> {
    let rooms: Array<Channel> = [];
    rooms = [...await this.ChannelRepository.createQueryBuilder('room')
      .where('room.isPrivate = false').getMany()]
    rooms = [...rooms, ...await this.ChannelRepository.createQueryBuilder('room')
      .where('room.isPrivate = true')
      .innerJoin('room.users', 'users')
      .where('users.ftId = :ftId', { ftId })
      .getMany()]
    return rooms;
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

