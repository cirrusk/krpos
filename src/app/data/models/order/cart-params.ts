export class CartParams {
    pickupStore: string;
    cartType: string;
    constructor( _pickupStore?: string,
                 _cartType?: string) {
       this.pickupStore = _pickupStore;
       this.cartType = _cartType;
    }
}
