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

  @Column({ type: 'bigint', default: Date.now() })
    lastAccess: number

  @Column({ unique: true })
    ftId: number

  @Column({ unique: true, nullable: true })
    email: string

  @Column({ select: false, nullable: true })
    authToken: string

  @Column({ default: false })
    twoFA: boolean

  @Column({ default: false, nullable: true })
    isVerified: boolean

  @Column('uuid', { unique: true })
    socketKey: string

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

  @Column({ default: 0 })
    rank: number

  @Column({ default: 0, type: 'double precision' })
    winrate: number

  @ManyToMany(() => Result, (result: Result) => result.players)
  @JoinTable()
    results: Result[]

  @OneToMany(() => Message, (message: Message) => message.author)
    messages: Message[]

  @ManyToMany(() => Channel, (channel: Channel) => channel.users)
  @JoinTable()
    channels: Channel[]

  @ManyToMany(() => User)
  @JoinTable()
    blocked: User[]

  @ManyToMany(() => User)
  @JoinTable()
    followers: User[]

  @ManyToMany(() => User)
  @JoinTable()
    friends: User[]
}

export default User
