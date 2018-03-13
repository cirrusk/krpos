import { Injectable } from "@angular/core";

import { ProductDataProvider } from './provider/productdata.provider';
import { ProductVO } from "../vo/product.vo";

@Injectable()
export class ProductSearchService {
    constructor(private productDataProvider: ProductDataProvider) {

    }

    public searchSKUCode(skuCode: string): ProductVO | null {
        return this.productDataProvider.searchProductCode(skuCode);
    }

    public searchBarcode(barcode: string): ProductVO | null {
        return this.productDataProvider.searchBarcode(barcode);
    }
}