import {IsNumber, IsString} from 'class-validator';

export class CreateBetDto {
  @IsNumber()
  amount: number;
  @IsString()
  userId: string;
}
