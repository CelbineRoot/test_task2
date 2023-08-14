import { ApiProperty } from '@nestjs/swagger';

export class AddBetDocs {
  @ApiProperty({ description: 'Сумма ставки' })
  amount: number;
  @ApiProperty({ description: 'UUID пользователя' })
  userId: string;
}
