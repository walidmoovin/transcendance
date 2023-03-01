import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable
} from 'typeorm'

import Message from 'src/chat/model/message.entity'
import Channel from 'src/chat/model/channel.entity'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
    id: number;

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
  @JoinTable()
    blocked: User[]

  @ManyToMany(() => User, (user) => user.following)
  @JoinTable()
    followers: User[]
  
  @ManyToMany(() => User, (user) => user.followers)
    following: User[]

  @ManyToMany(() => User, (user) => user.friends)
    friends: User[]

  // @Column({ default: { wr: -1, place: -1 } })
  // rank: { wr: number; place: number };
}

export default User
