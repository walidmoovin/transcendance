import { CreateChannelDto } from './create-channel.dto'

export class UpdateChannelDto extends CreateChannelDto {
  users: [number]
  messages: [number]
  owners: [number] // user id
  banned: [number] // user id
  muted: [number] // user id
}
