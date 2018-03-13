import { Component } from "@angular/core";
import { FormGroup, FormBuilder, FormControl } from "@angular/forms";

import { AddCartBroker } from "../../broker/cart/addcart.broker";
import { ProductSearchService } from "../../service/product.search.service";

@Component({
    selector: 'product-search',
    template: `
    <h2>Product Search</h2>
    <form
        [formGroup]="productSearchForm"
        (ngSubmit)="onSubmit(productSearchForm)"
        class="pure-form">
        <label>
            Barcode Here
            <input type="text" name="productSearch" formControlName="productSearch" autofocus>
        </label>
    </form>
    `,
})
export class ProductSearchComponent {

    private productSearchForm: FormGroup;

    constructor(
        private addCartBroker: AddCartBroker,
        private productSearchService: ProductSearchService,
        private fb: FormBuilder) {

    }

    ngOnInit() {
        this.productSearchForm = this.fb.group({
            productSearch: new FormControl()
        });
    }

    public onSubmit(form: FormGroup) {
        let barcode: string = form.value.productSearch;

        if (barcode !== null) {
            console.log(`Searching ${barcode}`);
            let searchResult = this.productSearchService.searchBarcode(barcode);

            console.log('Calling observable addtoCartDatashare');
            this.addCartBroker.sendMessage(searchResult);

            form.reset();
        }
    }
}