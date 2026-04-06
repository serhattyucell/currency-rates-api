import { ApiProperty } from '@nestjs/swagger';

export class RateResponseDto {
  @ApiProperty({ example: 'USD' })
  currencyCode: string;

  @ApiProperty({ example: 1 })
  unit: number;

  @ApiProperty({ example: 'ABD DOLARI' })
  isim: string;

  @ApiProperty({ example: 'US DOLLAR' })
  currencyName: string;

  @ApiProperty({ example: 34.1234, required: false })
  forexBuying?: number;

  @ApiProperty({ example: 34.5678, required: false })
  forexSelling?: number;

  @ApiProperty({ example: 34.0000, required: false })
  banknoteBuying?: number;

  @ApiProperty({ example: 34.5000, required: false })
  banknoteSelling?: number;

  @ApiProperty({ example: 1.0, required: false })
  crossRateUSD?: number;

  @ApiProperty({ example: 0.0, required: false })
  crossRateOther?: number;
}
