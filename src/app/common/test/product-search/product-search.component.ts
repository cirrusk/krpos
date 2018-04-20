import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';

import { ProductSearchService } from './../../../service/product.search.service';
import { AddCartBroker } from './../../../broker/cart/addcart.broker';

@Component({
  selector: 'pos-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.css']
})
export class ProductSearchComponent implements OnInit {

  productSearchForm: FormGroup;
  constructor(
    private addCartBroker: AddCartBroker,
    private productSearchService: ProductSearchService,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.productSearchForm = this.fb.group({
      productSearch: new FormControl()
    });
  }

  public onSubmit(form: FormGroup) {
    const barcode: string = form.value.productSearch;

    if (barcode !== null) {
        console.log(`Searching ${barcode}`);
        const searchResult = this.productSearchService.searchBarcode(barcode);

        console.log('Calling observable addtoCartDatashare');
        this.addCartBroker.sendMessage(searchResult);

        form.reset();
    }
  }

}
