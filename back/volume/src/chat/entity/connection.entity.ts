import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'

import Channel from './channel.entity'
import User from 'src/users/entity/user.entity'

@Entity()
export default class ConnectedUser {
  @OneToOne(() => User)
    user: User

  @OneToOne(() => Channel)
  @JoinColumn()
    channel: Channel

  @PrimaryGeneratedColumn()
    socket: string
}
