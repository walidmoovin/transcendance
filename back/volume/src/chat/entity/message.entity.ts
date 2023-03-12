import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

import { User } from 'src/users/entity/user.entity'
import { Channel } from './channel.entity'

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    text: string

  @ManyToOne(() => User, (author: User) => author.messages)
  @JoinColumn()
    author: User

  @ManyToOne(() => Channel, (channel: Channel) => channel.messages)
  @JoinTable()
    channel: Channel

  @CreateDateColumn()
    createdAt: Date
}

export default Message
