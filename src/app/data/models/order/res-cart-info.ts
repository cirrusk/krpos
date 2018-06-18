import { Cart } from './cart';
import { CartModification } from './cart-modification';

export class ResCartInfo {
    cartList: Cart;
    cartModification: CartModification[];

    constructor(_cartList?: Cart, _cartModification?: CartModification[]) {
        this.cartList = _cartList;
        this.cartModification = _cartModification;
    }
}
