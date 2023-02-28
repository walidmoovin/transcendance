import { User } from 'src/users/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
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
    created_at: Date
}

export default Message
