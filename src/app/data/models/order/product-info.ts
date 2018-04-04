import { Accounts } from './accounts';
import { Price } from './price';
import { Principal } from './principal';

export class ProductInfo {
    code: string;
    name: string;
    url: string;
    description: string;
    purchasable: boolean;
    price: Price;
    constructor() {
    }
}
