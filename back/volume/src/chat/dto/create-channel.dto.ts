import { Transform } from 'class-transformer';
import { IsPositive, IsAlpha, IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateChannelDto {
  @IsOptional()
  @IsPositive()
    id: number;

  @IsString()
    name: string;

  @IsNumber()
    owner: number;

  @IsOptional()
    password: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
    isPrivate: string;
}
