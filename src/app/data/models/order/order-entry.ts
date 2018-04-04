import { ProductInfo } from './product-info';
import { Price } from './price';

export class OrderEntry {
    entryNumber: number;
    quantity: number;
    basePrice: Price;
    totalPrice: Price;
    product: ProductInfo;

    constructor() {

    }
}
