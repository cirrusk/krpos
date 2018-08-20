import { Product } from '../common/product';

export class OrderEntries {
    product: Product;
    quantity: string;
    serialNumbersCodes?: Array<string>;
    constructor(product?: Product, quantity?: string, serialNumbersCodes?: Array<string>) {
        this.product = product;
        this.quantity = quantity;
        this.serialNumbersCodes = serialNumbersCodes;
    }
}
