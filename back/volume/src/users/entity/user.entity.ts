import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable
} from 'typeorm'

import Message from 'src/chat/entity/message.entity'
import Channel from 'src/chat/entity/channel.entity'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
    id: number

  @Column({ unique: true })
    ftId: number

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
  @JoinTable()
    blocked: User[]

  @ManyToMany(() => User)
  @JoinTable()
    followers: User[]

  @ManyToMany(() => User)
  @JoinTable()
    friends: User[]

  // @Column({ default: { wr: -1, place: -1 } })
  // rank: { wr: number; place: number };
}

export default User
