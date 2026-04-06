import { ApiProperty } from '@nestjs/swagger';

export class MetaResponseDto {
  @ApiProperty({ example: '2024-01-15' })
  date: string;

  @ApiProperty({ example: '2024/15' })
  bulletinNo: string;

  @ApiProperty({ example: 'https://www.tcmb.gov.tr/kurlar/today.xml' })
  source: string;
}
