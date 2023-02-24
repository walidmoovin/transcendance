import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
    id: number

  @Column({ unique: true })
    id_42: number

  @Column({ unique: true })
    username: string

  @Column()
    avatar: string

  @Column({ default: 'online' })
    status: string
}
