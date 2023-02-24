import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ApiController } from './api.controller'

@Module({
  imports: [HttpModule],
  controllers: [ApiController],
})

export class ApiModule { }
