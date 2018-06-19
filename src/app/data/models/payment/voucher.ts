import { CurrencyData } from './payment-capture';
import { Price } from '../order/price';

export class VoucherList {
    vouchers: Array<Voucher>;
}
export class Voucher {
    code: string;
    voucherCode: string;
    name: string;
    description: string;
    value: number;
    valueFormatted: string;
    valueString: string;
    freeShipping: boolean;
    currency: CurrencyData; // CurrencyWsDTO
    appliedValue: Price; // PriceWsDTO
}
