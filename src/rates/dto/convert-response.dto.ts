import { ApiProperty } from '@nestjs/swagger';

export class ConvertResponseDto {
  @ApiProperty({ example: 'USD' })
  from: string;

  @ApiProperty({ example: 'TRY' })
  to: string;

  @ApiProperty({ example: 100 })
  amount: number;

  @ApiProperty({ example: 3456.78 })
  result: number;

  @ApiProperty({ example: 34.5678 })
  rate: number;

  @ApiProperty({ example: 'ForexSelling' })
  rateType: string;
}
