import {
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { type CreateUserDto, type UpdateUserDto } from './user.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>
  ) { }

  async getAllUsers(): Promise<User[]> {
    return await this.usersRepository.find({})
  }

  async getOneUser(username: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ username: username })
    if (user) return user
    throw new NotFoundException(`User with username: ${username} not found`)
  }

  async getOneUser42(id_42: number): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id_42: id_42 })
    if (user) return user;
    throw new NotFoundException(`User with id_42: ${id_42} not found`)
  }

  async create(userData: CreateUserDto) {
    try {
      const newUser= this.usersRepository.create(userData)
      return await this.usersRepository.save(newUser)
    } catch (err) {
      throw new Error(`Error creating ${err} user ${err.message}`)
    }
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOneBy({ id: id })
    if (user) return user;
    throw new NotFoundException(`User #${id} not found`)
  }

  async update(id: number, changes: UpdateUserDto) {
    const updatedUser = await this.findOne(id)
    this.usersRepository.merge(updatedUser, changes)
    return await this.usersRepository.save(updatedUser)
  }
}
