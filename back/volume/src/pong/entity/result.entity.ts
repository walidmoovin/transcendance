import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn
} from 'typeorm'

import User from 'src/users/entity/user.entity'

@Entity()
export default class Result {
  @PrimaryGeneratedColumn()
    id: number

  @ManyToMany(() => User, (player: User) => player.results)
    players: Array<User | null> // TODO: change to User[] for final version

  @Column('text', { array: true })
  public score: number[]

  @CreateDateColumn()
    date: Date
}
