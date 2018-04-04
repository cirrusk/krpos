import { AmwayValue } from './amway-value';

export class BasePrice {
    currencyIso: string;
    value: number;
    priceType: string; // null,
    formattedValue: string; // null,
    minQuantity: number; // null,
    maxQuantity: number; // null,
    amwayValue: AmwayValue; // null
}
