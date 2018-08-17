export class Product {
    code: string;
    name: string;
    price: number;
    qty: number;
    barcode: string;
    constructor(code?: string, name?: string, price?: number, qty?: number, barcode?: string) {
        this.code = code;
        this.name = name;
        this.price = price;
        this.qty = qty;
        this.barcode = barcode;
    }
}

export class ProductList {
    products: Array<Product>;
    catalog: string;
    version: string;
    totalProductCount: number;
    totalPageCount: number;
    currentPage: number;
}
