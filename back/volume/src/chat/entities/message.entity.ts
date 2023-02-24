import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne
} from 'typeorm'

import { Channel } from './channel.entity'
import { User } from 'src/users/user.entity'

@Entity('message')
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number

  @Column()
  public content: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  public author: User

  @ManyToOne(() => Channel)
  @JoinColumn({ name: 'channel_id' })
  public channel: Channel
}
