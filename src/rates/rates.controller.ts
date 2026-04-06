import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { RatesService } from './rates.service';
import { RateResponseDto } from './dto/rate-response.dto';
import { ConvertQueryDto } from './dto/convert-query.dto';
import { ConvertResponseDto } from './dto/convert-response.dto';
import { MetaResponseDto } from './dto/meta-response.dto';

@ApiTags('rates')
@ApiSecurity('api-key')
@Controller('v1/rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all currency rates' })
  @ApiResponse({
    status: 200,
    description: 'List of all currency rates',
    type: [RateResponseDto],
  })
  async getAllRates(): Promise<RateResponseDto[]> {
    return this.ratesService.getAllRates();
  }

  @Get('convert')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Convert between currencies' })
  @ApiResponse({
    status: 200,
    description: 'Conversion result',
    type: ConvertResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  async convert(@Query() query: ConvertQueryDto): Promise<ConvertResponseDto> {
    return this.ratesService.convert(query.from, query.to, query.amount);
  }

  @Get('meta')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get metadata about rates' })
  @ApiResponse({
    status: 200,
    description: 'Metadata',
    type: MetaResponseDto,
  })
  async getMeta(): Promise<MetaResponseDto> {
    return this.ratesService.getMeta();
  }

  @Get(':code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get currency rate by code' })
  @ApiResponse({
    status: 200,
    description: 'Currency rate',
    type: RateResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  async getRateByCode(@Param('code') code: string): Promise<RateResponseDto> {
    return this.ratesService.getRateByCode(code);
  }
}
