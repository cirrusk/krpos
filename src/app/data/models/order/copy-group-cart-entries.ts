import { CartInfo, AmwayExtendedOrdering } from '../..';

export class CopyGroupCartEntries {
    cartInfo: CartInfo;
    amwayExtendedOrdering: AmwayExtendedOrdering;

    constructor(_cartInfo: CartInfo, _amwayExtendedOrdering: AmwayExtendedOrdering) {
        this.cartInfo = _cartInfo;
        this.amwayExtendedOrdering = _amwayExtendedOrdering;
    }
}
