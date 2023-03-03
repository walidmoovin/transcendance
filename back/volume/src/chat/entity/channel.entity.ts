import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import * as bcrypt from 'bcrypt'

import { User } from 'src/users/entity/user.entity'
import { Message } from './message.entity'

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    name: string

  @ManyToMany(() => User)
  @JoinTable()
    owners: User[]

  @ManyToMany(() => User)
  @JoinTable()
    users: User[]

  @OneToMany(() => Message, (message: Message) => message.channel)
    messages: Message[]

  @OneToMany(() => User, (user: User) => user.id) // refuse connection
    banned: User[]

  @OneToMany(() => User, (user: User) => user.id) // refuse post
    muted: User[]

  @Column({ select: false })
    password: string

  @BeforeInsert()
  async hashPassword () {
    this.password = await bcrypt.hash(
      this.password,
      Number(process.env.HASH_SALT)
    )
  }
}

export default Channel
