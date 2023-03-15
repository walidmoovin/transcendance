
import { IsNumber, IsString} from 'class-validator'

export class IdDto {
  @IsNumber()
    id: number
}

export class PasswordDto {
  @IsString()
    password: string
}

export class MuteDto {
    data: Array<number>
}
