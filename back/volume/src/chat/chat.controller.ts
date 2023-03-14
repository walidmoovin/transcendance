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
import { ChannelService } from './chat.service'

import { CreateChannelDto } from './dto/create-channel.dto'
import { UpdateChannelDto } from './dto/update-channel.dto'

import type User from 'src/users/entity/user.entity'
import type Channel from './entity/channel.entity'
import { Profile42 } from 'src/auth/42.decorator'
import { Profile } from 'passport-42'

@Controller('channels')
export class ChatController {
  constructor (
    private readonly channelService: ChannelService,
    private readonly usersService: UsersService
  ) {}

  @Post(':id/admin')
  async addAdmin (@Param('id') id: number, @Body() userId: number) {
    const channel = await this.channelService.getChannel(id)
    const user: User | null = await this.usersService.findUser(userId)
    if (user == null) throw new NotFoundException(`User #${userId} not found`)
    channel.admins.push(user)
    this.channelService.update(channel)
  }

  @Delete(':id/admin')
  async removeAdmin (@Param('id') id: number, @Body() userId: number) {
    const channel = await this.channelService.getChannel(id)
    channel.admins = channel.admins.filter((usr: User) => {
      return usr.ftId !== userId
    })
    this.channelService.update(channel)
  }

  @Post(':id/ban')
  async addBan (@Param('id') id: number, @Body() userId: number) {
    const channel = await this.channelService.getChannel(id)
    const user: User | null = await this.usersService.findUser(userId)
    if (user == null) throw new NotFoundException(`User #${userId} not found`)
    channel.banned.push(user)
    this.channelService.update(channel)
  }

  @Post(':id/mute')
  async addMute (@Param('id') id: number, @Body() userId: number) {
    const channel = await this.channelService.getChannel(id)
    const user: User | null = await this.usersService.findUser(userId)
    if (user == null) throw new NotFoundException(`User #${userId} not found`)
    channel.muted.push(user)
    this.channelService.update(channel)
  }

  @Delete(':id/mute')
  async removeMute (@Param('id') id: number, @Body() userId: number) {
    const channel = await this.channelService.getChannel(id)
    channel.muted = channel.muted.filter((usr: User) => {
      return usr.ftId !== userId
    })
    this.channelService.update(channel)
  }

  @Delete(':id')
  @UseGuards(AuthenticatedGuard)
  async deleteChannel (@Profile42() profile: Profile, @Param('id') id: number) {
    if (await this.channelService.isOwner(id, +profile.id)) {
      await this.channelService.removeChannel(id)
      return
    }
    throw new BadRequestException('You are not the owner of this channel')
  }

  @Get()
  @UseGuards(AuthenticatedGuard)
  async getChannelsForUser (@Profile42() profile: Profile): Promise<Channel[]> {
    return await this.channelService.getChannelsForUser(profile.id)
  }

  @Post()
  async createChannel (@Body() channel: CreateChannelDto) {
    return await this.channelService.createChannel(channel)
  }
}
