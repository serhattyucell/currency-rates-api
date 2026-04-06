import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConvertQueryDto {
  @ApiProperty({ example: 'USD', description: 'Source currency code' })
  @IsString()
  @IsNotEmpty()
  from: string;

  @ApiProperty({ example: 'TRY', description: 'Target currency code' })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ example: 100, description: 'Amount to convert', minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount: number;
}
