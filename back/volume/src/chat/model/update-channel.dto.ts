import { PartialType } from '@nestjs/mapped-types'
import { CreateChannelDto } from './create-channel.dto'
import { type Message } from './message.entity'
import { type User } from 'src/users/user.entity'
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
