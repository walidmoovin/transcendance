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
import Result from 'src/pong/entity/result.entity'

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
    avatar: string

  @Column({ default: 0 })
    wins: number

  @Column({ default: 0 })
    looses: number

  @Column({ default: 0 })
    matchs: number

  @Column({ default: 0})
    rank: number

  @Column({ default: 0 , type: "double precision"})
    winrate: number

  @ManyToMany(() => Result, (result: Result) => result.players)
  @JoinTable()
    results: Result[]

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
