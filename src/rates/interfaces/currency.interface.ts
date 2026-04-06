export interface Currency {
  currencyCode: string;
  unit: number;
  isim: string;
  currencyName: string;
  forexBuying?: number;
  forexSelling?: number;
  banknoteBuying?: number;
  banknoteSelling?: number;
  crossRateUSD?: number;
  crossRateOther?: number;
}

export interface TcmbData {
  date: string;
  bulletinNo: string;
  currencies: Currency[];
}
