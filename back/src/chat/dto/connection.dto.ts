import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class ConnectionDto {
  @IsString()
  @IsNotEmpty()
    socketKey: string

  @IsNumber()
    UserId: number

  @IsNumber()
    ChannelId: number

  @IsString()
  @IsOptional()
    pwd: string
}
