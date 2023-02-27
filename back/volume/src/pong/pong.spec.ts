import { Test, type TestingModule } from '@nestjs/testing'
import { Games } from './game/Games'

describe('Pong', () => {
  let provider: Games

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Games]
    }).compile()

    provider = module.get<Games>(Games)
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })
})
