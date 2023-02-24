import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { type CreateUserDto, type UpdateUserDto } from './user.dto'

@Injectable()
export class UsersService {
  constructor (
    @InjectRepository(User) private readonly usersRepository: Repository<User>
  ) {}

  async getAllUsers (): Promise<User[]> {
    return await this.usersRepository.find({})
  }

  async getOneUser (username: string): Promise<User | null> {
    return await this.usersRepository.findOneBy({ username })
  }

  async getOneUser42 (id_42: number): Promise<User | null> {
    return await this.usersRepository.findOneBy({ id_42 })
  }

  async create (newUser: CreateUserDto) {
    try {
      const user = new User()
      user.id_42 = newUser.id_42
      user.avatar = newUser.avatar
      user.username = newUser.username
      return await this.usersRepository.save(user)
    } catch (err) {
      throw new Error(`Error creating ${err} user ${err.message}`)
    }
  }

  async findOne (id: number) {
    const user = await this.usersRepository.findOneBy({ id })
    if (user == null) {
      throw new NotFoundException(`User #${id} not found`)
    }
    return user
  }

  async update (id: number, changes: UpdateUserDto) {
    const user = await this.findOne(id)
    await this.usersRepository.merge(user, changes)
    return await this.usersRepository.save(user)
  }
}
