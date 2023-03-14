import { IsNumber } from 'class-validator';

export class ConnectionDto {
  @IsNumber()
  UserId: number;
  @IsNumber()
  ChannelId: number;
  @IsNumber()
  SocketId: number;
}
