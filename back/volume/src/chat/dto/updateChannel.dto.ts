import { PartialType } from '@nestjs/mapped-types'
import { CreateChannelDto } from './createChannel.dto'
import { type Message } from '../entity/message.entity'
import { type User } from 'src/users/entity/user.entity'
import { IsString } from 'class-validator'

export class UpdateChannelDto extends PartialType(CreateChannelDto) {
  id: number

  users: [User]

  messages: [Message]

  owners: [number] // ftId

  admins: [number]

  banned: [number] // ftId

  muted: [number] // ftId

  @IsString()
    password: string
}
