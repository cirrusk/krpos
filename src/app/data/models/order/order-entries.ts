import { Product } from './../common/product';

export class OrderEntries {
    product: Product;
    quantity: string;
    qty: string;
    constructor(product?: Product, quantity?: string) {
        this.product = product;
        this.quantity = quantity;
        this.qty = quantity;
    }
}
