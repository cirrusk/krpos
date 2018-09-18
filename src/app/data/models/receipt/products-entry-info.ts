export class ProductsEntryInfo {
    idx: string;
    skuCode: string;
    productName: string;
    price: string;
    qty: string;
    totalPrice: string;
    giveAway: string;
    constructor(idx: number, skuCode: string, productName: string, price: number, qty: number, totalPrice: number, giveAway?: string) {
        this.idx = String(idx);
        this.skuCode = skuCode;
        this.productName = productName;
        this.price = String(price);
        this.qty = String(qty);
        this.totalPrice = String(totalPrice);
        this.giveAway = String(giveAway);
    }
}
