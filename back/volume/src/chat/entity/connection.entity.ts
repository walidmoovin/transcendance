import { Column, Entity, OneToOne } from 'typeorm'

import Channel from './channel.entity'
import User from 'src/users/entity/user.entity'

@Entity()
export class connectedUser {
  @OneToOne(() => User)
    user: User

  @OneToOne(() => Channel, (channel) => channel.id)
    channel: Channel

  @Column()
    socket: string
}
