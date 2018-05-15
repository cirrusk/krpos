import { AmwayValue } from '../common/amway-value';

export class BasePrice {
    currencyIso: string;
    value: number;
    priceType: string; // enum (BUY, FROM)
    formattedValue: string;
    minQuantity: number; // integer(int64)
    maxQuantity: number; // integer(int64)
    amwayValue: AmwayValue; // ?
}
