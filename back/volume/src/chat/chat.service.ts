import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { type CreateChannelDto } from './dto/create-channel.dto'
import { UsersService } from 'src/users/users.service'

import type User from 'src/users/entity/user.entity'
import Channel from './entity/channel.entity'

@Injectable()
export class ChannelService {
  constructor (
    @InjectRepository(Channel)
    private readonly ChannelRepository: Repository<Channel>,
    private readonly usersService: UsersService
  ) {}

  async createChannel (channel: CreateChannelDto): Promise<Channel> {
    const user: User | null = await this.usersService.findUser(channel.owner)
    if (user == null) 
      throw new NotFoundException(`User #${channel.owner} not found`)
    const newChannel = new Channel()
    newChannel.owner = user
    newChannel.users = [user]
    newChannel.admins = [user]
    newChannel.name = channel.name
    newChannel.isPrivate = channel.isPrivate
    newChannel.password = channel.password
    return await this.ChannelRepository.save(newChannel)
  }

  async updatePassword (id: number, password: string) {
    let channel: Channel | null = await this.ChannelRepository.findOneBy({id})
    if (channel === null) { throw new NotFoundException(`Channel #${id} not found`) }
    channel.password = password
    await this.ChannelRepository.save(channel)
  }

  async getChannelsForUser (ftId: number): Promise<Channel[]> {
    let rooms: Channel[] = []
    rooms = [
      ...(await this.ChannelRepository.createQueryBuilder('room')
        .where('room.isPrivate = false')
        .getMany())
    ]

    rooms = [
      ...rooms,
      ...(await this.ChannelRepository.createQueryBuilder('room')
        .innerJoin('room.users', 'users')
        .where('room.isPrivate = true')
        .andWhere('users.ftId = :ftId', { ftId })
        .getMany())
    ]
    return rooms
  }

  async addUserToChannel (channel: Channel, user: User): Promise<Channel> {
    channel.owner = user
    return await this.ChannelRepository.save(channel)
  }

  async getChannel (id: number): Promise<Channel> {
    const channel = await this.ChannelRepository.findOneBy({ id })
    if (channel == null) { throw new NotFoundException(`Channel #${id} not found`) }
    return channel
  }

  async getFullChannel (id: number): Promise<Channel> {
    const channel = await this.ChannelRepository.findOne({
      where: { id },
      relations: ['users', 'admins', 'banned', 'muted', 'owner']
    })
    if (channel == null) { throw new NotFoundException(`Channel #${id} not found`) }
    return channel
  }

  async update (channel: Channel) {
    await this.ChannelRepository.update(channel.id, channel)
  }

  async save (channel: Channel) {
    await this.ChannelRepository.save(channel)
  }

  async removeChannel (channelId: number) {
    await this.ChannelRepository.delete(channelId)
  }

  async isOwner (id: number, userId: number): Promise<boolean> {
    const channel = await this.ChannelRepository.findOne({
      where: { id },
      relations: { owner: true }
    })
    if (channel == null) { throw new NotFoundException(`Channel #${id} not found`) }
    return channel.owner.ftId === userId
  }

  async isAdmin (id: number, userId: number): Promise<boolean> {
    const channel = await this.ChannelRepository.findOne({
      where: { id },
      relations: { admins: true }
    })
    if (channel == null) { throw new NotFoundException(`Channel #${id} not found`) }
    return channel.admins.findIndex((user) => user.ftId === userId) != -1
  }

  async isUser (id: number, userId: number): Promise<boolean> {
    const channel = await this.ChannelRepository.findOne({
      where: { id },
      relations: { users: true }
    })
    if (channel == null) { throw new NotFoundException(`Channel #${id} not found`) }
    return channel.users.findIndex((user) => user.ftId === userId) != -1
  }

  async isBanned (id: number, userId: number): Promise<boolean> {
    const channel = await this.ChannelRepository.findOne({
      where: { id },
      relations: { banned: true }
    })
    if (channel == null) { throw new NotFoundException(`Channel #${id} not found`) }
    return channel.banned.findIndex((user) => user.ftId === userId) != -1
  }

  async getMuteDuration (id: number, userId: number): Promise<number> {
    const channel = await this.ChannelRepository.findOne({
      where: { id },
      relations: { muted: true }
    })
    if (channel == null) { throw new NotFoundException(`Channel #${id} not found`) }

    const mutation: Array<number> | undefined =  channel.muted.find((mutation) => mutation[0] === userId)
    if (mutation == null) { return 0 }
    return mutation[1]

  }
}
