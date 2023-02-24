import {
  Entity,
  PrimaryGeneratedColumn,
  JoinTable,
  OneToMany,
  ManyToMany
} from 'typeorm'

import { Message } from './message.entity'
import { User } from 'src/users/user.entity'

@Entity('channel')
export class Channel {
  @PrimaryGeneratedColumn()
    id: number

  @OneToMany(() => Message, (message) => message.channel)
    message: Message[]

  @ManyToMany(() => User)
  @JoinTable({
    name: 'users_id',
    joinColumn: {
      name: 'channel',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'user',
      referencedColumnName: 'id'
    }
  })
    user: User[]
}
