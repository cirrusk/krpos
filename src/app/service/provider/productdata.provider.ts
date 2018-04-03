import { Injectable } from '@angular/core';

import { Product } from './../../interface/product.interface';

@Injectable()
export class ProductDataProvider {
    private products: Array<Product>;

    constructor() {
        this.products = [
            { code: 'a1234', name: 'Bioderma', price: 8000, qty: 100, barcode: '3401399372346'},
            { code: 'b1234', name: 'Handcream', price: 10000, qty: 100, barcode: '8806194001227'},
            { code: 'c1234', name: 'Marlboro Gold', price: 4500, qty: 100, barcode: '7622100913313'},
        ];
    }

    public searchProductCode(code: string): null {
        // for (const item of this.products) {
        //     if (item.code === code) {
        //         console.log(`Found name ${item.name}`);
        //         return new ProductVO(item.code, item.name, item.price, item.qty, item.barcode);
        //     }
        // }

        // console.log('No item found...');

        return null;
    }

    public searchBarcode(barcode: string): null {
        // for (const item of this.products) {
        //     if (item.barcode === barcode) {
        //         console.log(`Found name ${item.name}`);
        //         return new ProductVO(item.code, item.name, item.price, item.qty, item.barcode);
        //     }
        // }

        // console.log('No item found...');

        return null;
    }
}
