import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import User from 'src/users/entity/user.entity'
import Message from './message.entity'
import * as bcrypt from 'bcrypt'

@Entity()
export default class Channel {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    name: string

  @Column({ default: false })
    isPrivate: boolean

  @Column({ select: false, default: '' })
    password: string

  @BeforeInsert()
  async hashPassword () {
    if (this.password === '') return
    this.password = await bcrypt.hash(
      this.password,
      Number(process.env.HASH_SALT)
    )
  }

  @ManyToMany(() => User)
  @JoinTable()
    users: User[]

  @OneToMany(() => Message, (message: Message) => message.channel)
    messages: Message[]

  @ManyToOne(() => User)
  @JoinColumn()
    owner: User

  @ManyToMany(() => User)
  @JoinTable()
    admins: User[]

  @ManyToMany(() => User) // refuse connection
  @JoinTable()
    banned: User[]

  @Column('text', {array: true})
    muted: number[][]
}
