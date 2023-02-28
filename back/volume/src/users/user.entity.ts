import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  ManyToMany,
  JoinColumn
} from 'typeorm'

import Message from 'src/chat/model/message.entity'
import Channel from 'src/chat/model/channel.entity'

@Entity()
export class User {
  @Column({ unique: true })
    id_42: number

  @Column({ unique: true })
    username: string

  @Column({ default: 'online' })
    status: string

  @Column({ name: 'avatar' })
  public avatar?: string

  @OneToMany(() => Message, (message: Message) => message.author)
    messages: Message[]

  @ManyToMany(() => Channel, (channel: Channel) => channel.users)
    rooms: Channel[]

  @ManyToMany(() => User)
    blocked: User[]

  @ManyToMany(() => User)
    friends: User[]

  // @Column({ default: { wr: -1, place: -1 } })
  // rank: { wr: number; place: number };
}

export default User
