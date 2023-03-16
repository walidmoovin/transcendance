import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  UseGuards
} from '@nestjs/common'
import { AuthenticatedGuard } from 'src/auth/42-auth.guard'
import { UsersService } from 'src/users/users.service'
import { ChatService } from './chat.service'

import { CreateChannelDto } from './dto/create-channel.dto'
import { IdDto, PasswordDto, MuteDto } from './dto/updateUser.dto'

import type User from 'src/users/entity/user.entity'
import type Channel from './entity/channel.entity'
import { Profile42 } from 'src/auth/42.decorator'
import { Profile } from 'passport-42'

@Controller('channels')
@UseGuards(AuthenticatedGuard)
export class ChatController {
  constructor (
    private readonly channelService: ChatService,
    private readonly usersService: UsersService
  ) {}

  @Post(':id/invite')
  async addUser (
    @Param('id', ParseIntPipe) id: number,
      @Body() target: IdDto,
      @Profile42() profile: Profile
  ): Promise<void> {
    const channel = await this.channelService.getFullChannel(id)
    const user: User | null = await this.usersService.findUser(target.id)
    if (user == null) {
      throw new NotFoundException(`User #${target.id} not found`)
    }
    if (channel.isPrivate && channel.password === '') {
      throw new BadRequestException('You cannot add more users to a DM')
    }
    if (!(await this.channelService.isUser(channel.id, +profile.id))) {
      throw new BadRequestException(
        'You are not allowed to invite users to this channel'
      )
    }
    if (await this.channelService.isUser(channel.id, target.id)) {
      throw new BadRequestException('User is already in this channel')
    }
    if (await this.channelService.isBanned(channel.id, target.id)) {
      throw new BadRequestException('User is banned from this channel')
    }
    channel.users.push(user)
    await this.channelService.save(channel)
  }

  @Delete(':id/kick')
  async removeUser (
    @Param('id', ParseIntPipe) id: number,
      @Body() target: IdDto,
      @Profile42() profile: Profile
  ): Promise<void> {
    const channel = await this.channelService.getFullChannel(id)
    if (!(await this.channelService.isAdmin(channel.id, +profile.id))) {
      throw new BadRequestException(
        'You are not allowed to kick users from this channel'
      )
    }
    if (!(await this.channelService.isUser(channel.id, target.id))) {
      throw new BadRequestException('User is not in this channel')
    }
    if (await this.channelService.isOwner(channel.id, target.id)) {
      throw new BadRequestException('You cannot kick the owner of the channel')
    }
    channel.users = channel.users.filter((usr: User) => {
      return usr.ftId !== target.id
    })
    await this.channelService.save(channel)
  }

  @Get(':id/users')
  async getUsersOfChannel (@Param('id') id: number): Promise<User[]> {
    return (await this.channelService.getChannel(id)).users
  }

  @Post(':id/admin')
  async addAdmin (
    @Param('id', ParseIntPipe) id: number,
      @Body() target: IdDto,
      @Profile42() profile: Profile
  ): Promise<void> {
    const channel = await this.channelService.getFullChannel(id)
    const user: User | null = await this.usersService.findUser(target.id)
    if (user == null) {
      throw new NotFoundException(`User #${target.id} not found`)
    }
    if (!(await this.channelService.isOwner(channel.id, +profile.id))) {
      throw new BadRequestException('You are not the owner of this channel')
    }
    if (!(await this.channelService.isUser(channel.id, target.id))) {
      throw new BadRequestException('User is not in this channel')
    }
    if (await this.channelService.isAdmin(channel.id, target.id)) {
      throw new BadRequestException('User is already an admin of this channel')
    }
    channel.admins.push(user)
    await this.channelService.save(channel)
  }

  @Delete(':id/admin')
  async removeAdmin (
    @Param('id', ParseIntPipe) id: number,
      @Body() target: IdDto,
      @Profile42() profile: Profile
  ): Promise<void> {
    const channel = await this.channelService.getFullChannel(id)
    if (!(await this.channelService.isOwner(channel.id, +profile.id))) {
      throw new BadRequestException('You are not the owner of this channel')
    }
    if (!(await this.channelService.isAdmin(channel.id, target.id))) {
      throw new BadRequestException('User is not an admin of this channel')
    }
    channel.admins = channel.admins.filter((usr: User) => {
      return usr.ftId !== target.id
    })
    await this.channelService.save(channel)
  }

  @Post(':id/ban')
  async addBan (
    @Param('id', ParseIntPipe) id: number,
      @Body() target: IdDto,
      @Profile42() profile: Profile
  ): Promise<void> {
    const channel = await this.channelService.getFullChannel(id)
    const user: User | null = await this.usersService.findUser(target.id)
    if (user == null) {
      throw new NotFoundException(`User #${target.id} not found`)
    }
    if (!(await this.channelService.isAdmin(channel.id, +profile.id))) {
      throw new BadRequestException(
        'You are not allowed to ban users from this channel'
      )
    }
    if (await this.channelService.isOwner(channel.id, target.id)) {
      throw new BadRequestException('You cannot ban the owner of the channel')
    }
    if (await this.channelService.isBanned(channel.id, target.id)) {
      throw new BadRequestException('User is already banned from this channel')
    }
    channel.banned.push(user)
    await this.channelService.save(channel)
  }

  @Post(':id/mute')
  async addMute (
    @Param('id', ParseIntPipe) id: number,
      @Body() mute: MuteDto, // [userId, duration]
      @Profile42() profile: Profile
  ): Promise<void> {
    const channel = await this.channelService.getFullChannel(id)
    const user: User | null = await this.usersService.findUser(mute.data[0])
    if (user == null) {
      throw new NotFoundException(`User #${mute.data[0]} not found`)
    }
    if (!(await this.channelService.isAdmin(channel.id, +profile.id))) {
      throw new BadRequestException(
        'You are not allowed to mute users from this channel'
      )
    }
    if (await this.channelService.isOwner(channel.id, mute.data[0])) {
      throw new BadRequestException('You cannot mute the owner of the channel')
    }
    if (
      (await this.channelService.getMuteDuration(channel.id, mute.data[0])) > 0
    ) {
      throw new BadRequestException('User is already muted from this channel')
    }
    const newMute: number[] = [mute.data[0], Date.now() + mute.data[1] * 1000]
    channel.muted.push(newMute)
    await this.channelService.save(channel)
  }

  @Delete(':id')
  async deleteChannel (
    @Profile42() profile: Profile,
      @Param('id', ParseIntPipe) id: number
  ): Promise<void> {
    if (!(await this.channelService.isOwner(id, +profile.id))) {
      throw new BadRequestException('You are not the owner of this channel')
    }
    await this.channelService.removeChannel(id)
  }

  @Post(':id/password')
  async updatePassword (
    @Profile42() profile: Profile,
      @Param('id', ParseIntPipe) id: number,
      @Body() data: PasswordDto
  ): Promise<void> {
    if (await this.channelService.isOwner(id, +profile.id)) {
      throw new BadRequestException('You are not the owner of this channel')
    }
    await this.channelService.updatePassword(id, data.password)
  }

  @Get()
  async getChannelsForUser (@Profile42() profile: Profile): Promise<Channel[]> {
    return await this.channelService.getChannelsForUser(+profile.id)
  }

  @Get('dms/:otherName')
  async getDMsForUser (
    @Profile42() profile: Profile,
      @Param('otherName') otherName: string
  ): Promise<Channel[]> {
    const user = await this.usersService.findUser(profile.fdId)
    const other = await this.usersService.findUserByName(otherName)
    const channels = await this.channelService.getChannelsForUser(+profile.id)

    if (user === null) {
      throw new BadRequestException('User not found')
    }
    const dms = channels.filter((channel: Channel) => {
      return (
        (channel.name === (user.username + '&' + other.username) ||
          channel.name === (other.username + '&' + user.username)) &&
        channel.isPrivate &&
        (channel.password === undefined || channel.password === '')
      )
    })
    return dms
  }

  @Get(':id/leave')
  async leaveChannel (
    @Profile42() profile: Profile,
      @Param('id', ParseIntPipe) id: number
  ): Promise<void> {
    if (await this.channelService.isOwner(id, +profile.id)) {
      this.channelService.removeChannel(id)  // -> verify that the deletion the break others users behaviors.
    }
    const channel = await this.channelService.getFullChannel(id)
    channel.users = channel.users.filter((usr: User) => {
      return usr.ftId !== profile.id
    })
    await this.channelService.save(channel)
  }


  @Post()
  async createChannel (@Body() channel: CreateChannelDto): Promise<Channel> {
    return await this.channelService.createChannel(channel)
  }
}
