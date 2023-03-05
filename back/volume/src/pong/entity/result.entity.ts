import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
} from 'typeorm'

import User from 'src/users/entity/user.entity'

@Entity()
export default class Result {
  @PrimaryGeneratedColumn()
    id:number

  @ManyToMany(() => User, (player: User) => player.results)
    players: (User | null)[] // TODO: change to User[] for final version

  @Column('text', {array: true})
    public score: number[]
}
