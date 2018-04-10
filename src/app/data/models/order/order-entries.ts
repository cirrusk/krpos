import { Product } from './../common/product';

export class OrderEntries {
    product: Product;
    quantity: string;
    constructor(product?: Product, quantity?: string) {
        this.product = product;
        this.quantity = quantity;
    }
}
