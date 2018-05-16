import { CartInfo } from './cart-info';
import { CartModification } from './cart-modification';
export class CopyCartEntries {
    cartInfo: CartInfo;
    cartModification: CartModification[];
    constructor(_cartInfo: CartInfo, _cartModification: CartModification[]) {
        this.cartInfo = _cartInfo;
        this.cartModification = _cartModification;
    }
}
