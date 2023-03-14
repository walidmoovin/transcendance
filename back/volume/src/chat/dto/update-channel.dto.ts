import { PartialType } from '@nestjs/mapped-types';
import { CreateChannelDto } from './create-channel.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateChannelDto extends PartialType(CreateChannelDto) {
  id: number;
  @IsOptional()
  users: [number];
  @IsOptional()
  messages: [number];
  @IsOptional()
  owners: [number]; //user id
  @IsOptional()
  banned: [number]; //user id
  @IsOptional()
  muted: [number]; //user id
  @IsString()
  @IsOptional()
  password: string;
}
