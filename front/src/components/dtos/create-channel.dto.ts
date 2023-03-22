export class CreateChannelDto {
  name: string
  owner: number
  password: string
  isPrivate: boolean
  isDM: boolean
  otherDMedUsername: string
}
