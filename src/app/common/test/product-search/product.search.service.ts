import { Injectable } from '@angular/core';
import { ProductDataProvider } from './product-data-provider';
import { ProductData } from '../../../data';

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
