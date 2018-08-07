import { Cart } from './cart';
import { CartModification } from './cart-modification';

export class ResCartInfo {
    cartList: Cart;
    cartModifications: CartModifications; // CartModification[]; // CartModificationWsDTO
    // 2018.08.07 수정
    // AddToCart xml,json 을 위한 리턴 타입 변경 List<CartModificationWsDTO> -> CartModificationListWsDTO
    // constructor(_cartList?: Cart, _cartModifications?: CartModification[]) {
    constructor(_cartList?: Cart, _cartModifications?: CartModifications) {
        this.cartList = _cartList;
        this.cartModifications = _cartModifications;
    }
}

export class CartModifications {
    cartModifications: CartModification[]; // CartModificationWsDTO
    constructor(cartModifications: CartModification[]) {
        this.cartModifications = cartModifications;
    }
}
