
import { Injectable } from '@angular/core';

// import { ProductDataProvider } from './provider/productdata.provider';
import { ProductDataProvider } from './../core/provider/product-data-provider';
import { ProductData } from '../data/models/product-data';
// import { ProductVO } from "../vo/product.vo";



@Injectable()
export class ProductSearchService {
    constructor(private productDataProvider: ProductDataProvider) {

    }

    public searchSKUCode(skuCode: string): ProductData | null {
        return this.productDataProvider.searchProductCode(skuCode);
    }

    public searchBarcode(barcode: string): ProductData | null {
        return this.productDataProvider.searchBarcode(barcode);
    }
}
