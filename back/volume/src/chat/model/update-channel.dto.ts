import { PartialType } from '@nestjs/mapped-types';
import { CreateChannelDto } from './create-channel.dto';
import { Message } from './message.entity';
import { User } from 'src/users/user.entity';
import { IsString } from 'class-validator';

export class UpdateChannelDto extends PartialType(CreateChannelDto) {
  id: number;

  users: [User];

  messages: [Message];

  owners: [number]; //user id

  banned: [number]; //user id

  muted: [number]; //user id

  @IsString()
  password: string;
}
