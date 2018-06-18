import { ResCartInfo } from './res-cart-info';
import { CartInfo } from './cart-info';

export class CopyCartEntries {
    cartInfo: CartInfo;
    resCartInfo: ResCartInfo;
    constructor(_cartInfo: CartInfo, _resCartInfo: ResCartInfo) {
        this.cartInfo = _cartInfo;
        this.resCartInfo = _resCartInfo;
    }
}
