import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import User from 'src/users/entity/user.entity';
import Message from './message.entity';
import * as bcrypt from 'bcrypt';

@Entity()
export default class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: false })
  isPrivate: boolean;

  @Column({ select: false, default: '' })
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(
      this.password,
      Number(process.env.HASH_SALT),
    );
  }

  @ManyToMany(() => User, (user: User) => user.channels, {cascade: true})
  users: User[];

  @OneToMany(() => Message, (message: Message) => message.channel)
  messages: Message[];

  @OneToOne(() => User)
  owner: User;

  @ManyToMany(() => User)
  @JoinTable()
  admins: User[];

  @ManyToMany(() => User) //refuse connection
  banned: User[];

  @ManyToMany(() => User) //refuse post
  muted: User[];
}
