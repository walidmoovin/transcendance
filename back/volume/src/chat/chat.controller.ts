import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";
//import { channel, Channel } from "diagnostics_channel";
import { Channel } from './entity/channel.entity';
import { ChannelService } from "./chat.service";
import { CreateChannelDto } from "./dto/create-channel.dto";
import { UsersService } from "src/users/users.service";
import { UpdateChannelDto } from "./dto/update-channel.dto";
import { User } from "src/users/entity/user.entity";

@Controller("chat")
export class ChatController {
  private readonly channelService: ChannelService;
  private readonly usersService: UsersService;

  @Get("channels/:id")
  getChannelsForUser(@Param("id") id: number): Promise<Array<Channel>> {
    return this.channelService.getChannelsForUser(id);
  }

  @Post("channels")
  async createChannel(@Body() channel: CreateChannelDto) {
    return await this.channelService.createChannel(channel);
  }

  @Delete("channels/:id")
  async deleteChannel(@Param("id") id: number) {
    return await this.channelService.removeChannel(id);
  }

  @Post("channels/:id/owner")
  async moveOwner(@Param("id") id: number, @Body() userId: number) {
    const channel = await this.channelService.getChannel(id);
    const user: User | null = await this.usersService.findUser(userId);
    if (user == null) throw new NotFoundException(`User #${userId} not found`);
    channel.owner = user;
    this.channelService.update(channel);
  }

  @Post("channels/:id/admin")
  async addAdmin(@Param("id") id: number, @Body() userId: number) {
    const channel = await this.channelService.getChannel(id);
    const user: User | null = await this.usersService.findUser(userId);
    if (user == null) throw new NotFoundException(`User #${userId} not found`);
    channel.admins.push(user);
    this.channelService.update(channel);
  }

  @Delete("channels/:id/admin")
  async removeAdmin(@Param("id") id: number, @Body() userId: number) {
    const channel = await this.channelService.getChannel(id);
    channel.admins = channel.admins.filter((a) => {
      return a.ftId !== userId;
    });
    this.channelService.update(channel);
  }

  @Post("channels/:id/ban")
  async addBan(@Param("id") id: number, @Body() userId: number) {
    const channel = await this.channelService.getChannel(id);
    const user: User | null = await this.usersService.findUser(userId);
    if (user == null) throw new NotFoundException(`User #${userId} not found`);
    channel.banned.push(user);
    this.channelService.update(channel);
  }

  @Delete("channels/:id/ban")
  async removeBan(@Param("id") id: number, @Body() userId: number) {
    const channel = await this.channelService.getChannel(id);
    channel.banned = channel.banned.filter((a) => {
      return a.ftId !== userId;
    });
    this.channelService.update(channel);
  }

  @Post("channels/:id/mute")
  async addMute(@Param("id") id: number, @Body() userId: number) {
    const channel = await this.channelService.getChannel(id);
    const user: User | null = await this.usersService.findUser(userId);
    if (user == null) throw new NotFoundException(`User #${userId} not found`);
    channel.mute.push(user);
    this.channelService.update(channel);
  }
  @Delete("channels/:id/mute")
  async removeMute(@Param("id") id: number, @Body() userId: number) {
    const channel = await this.channelService.getChannel(id);
    channel.mute = channel.mute.filter((a) => {
      return a.ftId !== userId;
    });
    this.channelService.update(channel);
  }
}
