import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm'

import Channel from './channel.entity'
import User from 'src/users/entity/user.entity'

@Entity()
export default class ConnectedUser {
	@Column()
    user: number

	@Column()
    channel: number

  @PrimaryColumn()
    socket: string
}
