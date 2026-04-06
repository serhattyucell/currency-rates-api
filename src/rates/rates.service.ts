import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TcmbService } from './tcmb.service';
import { Currency } from './interfaces/currency.interface';
import { AppLogger } from '../common/utils/logger.util';

@Injectable()
export class RatesService {
  private readonly logger = new AppLogger(RatesService.name);

  constructor(
    private tcmbService: TcmbService,
    private configService: ConfigService,
  ) {}

  async getAllRates(): Promise<Currency[]> {
    const data = await this.tcmbService.getRates();
    return data.currencies;
  }

  async getRateByCode(code: string): Promise<Currency> {
    this.logger.debug(`Para birimi için kur aranıyor: ${code.toUpperCase()}`);
    const currencies = await this.getAllRates();
    const currency = currencies.find(
      (c) => c.currencyCode.toUpperCase() === code.toUpperCase(),
    );

    if (!currency) {
      this.logger.warn(`Para birimi bulunamadı: ${code.toUpperCase()}`);
      throw new NotFoundException(`Currency with code ${code} not found`);
    }

    this.logger.log(`${code.toUpperCase()} için kur bulundu`);
    return currency;
  }

  async convert(
    from: string,
    to: string,
    amount: number,
  ): Promise<{
    from: string;
    to: string;
    amount: number;
    result: number;
    rate: number;
    rateType: string;
  }> {
    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();
    this.logger.log(`${amount} ${fromUpper} ${toUpper}'ye dönüştürülüyor`);

    const currencies = await this.getAllRates();

    if (fromUpper === toUpper) {
      this.logger.debug('Aynı para birimi, doğrudan dönüşüm yapılıyor');
      return {
        from: fromUpper,
        to: toUpper,
        amount,
        result: amount,
        rate: 1,
        rateType: 'Direct',
      };
    }

    if (toUpper === 'TRY') {
      return this.convertToTry(currencies, fromUpper, amount);
    }

    if (fromUpper === 'TRY') {
      return this.convertFromTry(currencies, toUpper, amount);
    }

    return this.convertCrossCurrency(currencies, fromUpper, toUpper, amount);
  }

  private convertToTry(
    currencies: Currency[],
    from: string,
    amount: number,
  ): {
    from: string;
    to: string;
    amount: number;
    result: number;
    rate: number;
    rateType: string;
  } {
    const currency = currencies.find((c) => c.currencyCode.toUpperCase() === from);

    if (!currency) {
      throw new NotFoundException(`Currency with code ${from} not found`);
    }

    const rate =
      currency.forexSelling ?? currency.forexBuying ?? currency.banknoteSelling ?? currency.banknoteBuying;

    if (!rate) {
      throw new BadRequestException(`No rate available for ${from}`);
    }

    const result = (amount * rate) / currency.unit;
    const rateType = currency.forexSelling
      ? 'ForexSelling'
      : currency.forexBuying
      ? 'ForexBuying'
      : currency.banknoteSelling
      ? 'BanknoteSelling'
      : 'BanknoteBuying';

    return {
      from,
      to: 'TRY',
      amount,
      result,
      rate: rate / currency.unit,
      rateType,
    };
  }

  private convertFromTry(
    currencies: Currency[],
    to: string,
    amount: number,
  ): {
    from: string;
    to: string;
    amount: number;
    result: number;
    rate: number;
    rateType: string;
  } {
    const currency = currencies.find((c) => c.currencyCode.toUpperCase() === to);

    if (!currency) {
      throw new NotFoundException(`Currency with code ${to} not found`);
    }

    const rate =
      currency.forexBuying ?? currency.forexSelling ?? currency.banknoteBuying ?? currency.banknoteSelling;

    if (!rate) {
      throw new BadRequestException(`No rate available for ${to}`);
    }

    const result = (amount * currency.unit) / rate;
    const rateType = currency.forexBuying
      ? 'ForexBuying'
      : currency.forexSelling
      ? 'ForexSelling'
      : currency.banknoteBuying
      ? 'BanknoteBuying'
      : 'BanknoteSelling';

    return {
      from: 'TRY',
      to,
      amount,
      result,
      rate: rate / currency.unit,
      rateType,
    };
  }

  private convertCrossCurrency(
    currencies: Currency[],
    from: string,
    to: string,
    amount: number,
  ): {
    from: string;
    to: string;
    amount: number;
    result: number;
    rate: number;
    rateType: string;
  } {
    const fromCurrency = currencies.find((c) => c.currencyCode.toUpperCase() === from);
    const toCurrency = currencies.find((c) => c.currencyCode.toUpperCase() === to);

    if (!fromCurrency) {
      throw new NotFoundException(`Currency with code ${from} not found`);
    }

    if (!toCurrency) {
      throw new NotFoundException(`Currency with code ${to} not found`);
    }

    const fromRate =
      fromCurrency.forexSelling ?? fromCurrency.forexBuying ?? fromCurrency.banknoteSelling ?? fromCurrency.banknoteBuying;
    const toRate =
      toCurrency.forexBuying ?? toCurrency.forexSelling ?? toCurrency.banknoteBuying ?? toCurrency.banknoteSelling;

    if (!fromRate || !toRate) {
      throw new BadRequestException(`No rate available for conversion`);
    }

    const tryAmount = (amount * fromRate) / fromCurrency.unit;
    const result = (tryAmount * toCurrency.unit) / toRate;
    const rate = (toRate / toCurrency.unit) / (fromRate / fromCurrency.unit);

    const fromRateType = fromCurrency.forexSelling
      ? 'ForexSelling'
      : fromCurrency.forexBuying
      ? 'ForexBuying'
      : fromCurrency.banknoteSelling
      ? 'BanknoteSelling'
      : 'BanknoteBuying';

    const toRateType = toCurrency.forexBuying
      ? 'ForexBuying'
      : toCurrency.forexSelling
      ? 'ForexSelling'
      : toCurrency.banknoteBuying
      ? 'BanknoteBuying'
      : 'BanknoteSelling';

    return {
      from,
      to,
      amount,
      result,
      rate,
      rateType: `${fromRateType}/${toRateType}`,
    };
  }

  async getMeta(): Promise<{ date: string; bulletinNo: string; source: string }> {
    const data = await this.tcmbService.getRates();
    return {
      date: data.date,
      bulletinNo: data.bulletinNo,
      source: this.configService.get<string>('TCMB_URL', 'https://www.tcmb.gov.tr/kurlar/today.xml'),
    };
  }
}
