import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as xml2js from 'xml2js';
import axios from 'axios';
import { Currency, TcmbData } from './interfaces/currency.interface';
import { AppLogger } from '../common/utils/logger.util';

@Injectable()
export class TcmbService {
  private readonly logger = new AppLogger(TcmbService.name);
  private readonly cacheKey = 'tcmb_rates';

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getRates(): Promise<TcmbData> {
    const cached = await this.cacheManager.get<TcmbData>(this.cacheKey);
    if (cached) {
      this.logger.debug('Önbellekten kur verileri döndürülüyor');
      return cached;
    }

    this.logger.log('TCMB\'den kur verileri çekiliyor...');
    const data = await this.fetchAndParseRates();
    const ttl = this.configService.get<number>('CACHE_TTL_SECONDS', 3600);
    await this.cacheManager.set(this.cacheKey, data, ttl * 1000);
    AppLogger.success(`Kur verileri ${ttl} saniye için önbelleğe alındı`, TcmbService.name);

    return data;
  }

  private async fetchAndParseRates(): Promise<TcmbData> {
    const url = this.configService.get<string>('TCMB_URL');
    
    if (!url) {
      throw new Error('TCMB_URL is not configured');
    }
    
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'CurrencyRatesAPI/1.0',
        },
      });

      const parser = new xml2js.Parser({
        explicitArray: true,
        mergeAttrs: false,
      });

      const result = await parser.parseStringPromise(response.data);
      return this.parseXmlData(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
      this.logger.error(`TCMB verileri alınamadı: ${message}`);
      this.logger.warn('TCMB servisi kullanılamıyor, 503 hatası döndürülüyor');
      throw new ServiceUnavailableException('TCMB servisi kullanılamıyor');
    }
  }

  private parseXmlData(xmlData: unknown): TcmbData {
    interface CurrencyItem {
      $?: {
        CurrencyCode?: string;
        Unit?: string;
      };
      Isim?: string | string[];
      CurrencyName?: string | string[];
      ForexBuying?: string | string[];
      ForexSelling?: string | string[];
      BanknoteBuying?: string | string[];
      BanknoteSelling?: string | string[];
      CrossRateUSD?: string | string[];
      CrossRateOther?: string | string[];
    }

    interface TarihDate {
      $?: {
        Tarih?: string;
        Date?: string;
        Bulten_No?: string;
      };
      Currency?: CurrencyItem[];
    }

    const parsed = xmlData as { Tarih_Date?: TarihDate };
    const tarihData = parsed.Tarih_Date;
    
    if (!tarihData || !tarihData.$) {
      throw new Error('Geçersiz XML yapısı');
    }

    const date = tarihData.$?.Tarih || tarihData.$?.Date || '';
    const bulletinNo = tarihData.$?.Bulten_No || '';

    if (!tarihData.Currency || !Array.isArray(tarihData.Currency)) {
      throw new Error('Currency verisi bulunamadı veya geçersiz format');
    }

    const currencies: Currency[] = tarihData.Currency.map((curr: CurrencyItem) => {
      const getStringValue = (value: string | string[] | undefined): string => {
        if (!value) return '';
        return Array.isArray(value) ? value[0] || '' : value;
      };

      const getNumberValue = (value: string | string[] | undefined): number | undefined => {
        const str = getStringValue(value);
        return this.parseOptionalNumber(str);
      };

      return {
        currencyCode: curr.$?.CurrencyCode || '',
        unit: this.parseNumber(curr.$?.Unit),
        isim: getStringValue(curr.Isim),
        currencyName: getStringValue(curr.CurrencyName),
        forexBuying: getNumberValue(curr.ForexBuying),
        forexSelling: getNumberValue(curr.ForexSelling),
        banknoteBuying: getNumberValue(curr.BanknoteBuying),
        banknoteSelling: getNumberValue(curr.BanknoteSelling),
        crossRateUSD: getNumberValue(curr.CrossRateUSD),
        crossRateOther: getNumberValue(curr.CrossRateOther),
      };
    });

    return {
      date,
      bulletinNo,
      currencies,
    };
  }

  private parseNumber(value: string | undefined): number {
    if (!value) return 1;
    const parsed = parseFloat(value.replace(',', '.'));
    return isNaN(parsed) ? 1 : parsed;
  }

  private parseOptionalNumber(value: string | undefined): number | undefined {
    if (!value || typeof value !== 'string' || value.trim() === '') return undefined;
    const cleaned = value.replace(',', '.').trim();
    if (cleaned === '') return undefined;
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? undefined : parsed;
  }
}
