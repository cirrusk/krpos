export class CartParams {
    pickupStore: string;
    cartType: string;
    volumeAccount: string;
    constructor( _pickupStore?: string,
                 _cartType?: string,
                 _volumeAccount?: string) {
       this.pickupStore = _pickupStore;
       this.cartType = _cartType;
       this.volumeAccount = _volumeAccount;

    }

}
