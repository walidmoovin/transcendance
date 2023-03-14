import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import User from 'src/users/entity/user.entity';
import Channel from './channel.entity';

@Entity()
export default class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn()
  author: User;

  @ManyToOne(() => Channel, (channel) => channel.messages)
  @JoinTable()
  channel: Channel;

  @CreateDateColumn()
  created_at: Date;
}
