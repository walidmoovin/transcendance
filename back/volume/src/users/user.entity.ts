import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from 'src/chat/model/message.entity';
import { Channel } from 'src/chat/model/channel.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  id_42: number;

  @Column({ unique: true })
  username: string;

  @Column({ default: '' })
  avatar: string;

  @Column({ default: 'online' })
  status: string;

  @OneToMany(() => Message, (message: Message) => message.author)
  messages: Message[];

  @ManyToMany(() => Channel, (channel: Channel) => channel.users)
  rooms: Channel[];

  @OneToMany(() => User, (user) => user.id) //filter messages
  blocked: User[];

  //@Column({ default: { wr: -1, place: -1 } })
  //rank: { wr: number; place: number };
}
