import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AddCartBroker } from './../../../../broker/cart/addcart.broker';
import { ProductData } from '../../../../data/models/product-data';
import { CartEntry } from './../../../../data/models/cart-entry';

@Component({
  selector: 'pos-cart-list',
  templateUrl: './cart-list.component.html',
  styleUrls: ['./cart-list.component.css']
})
export class CartListComponent implements OnInit, OnDestroy {
  private cartList: Array<CartEntry>;

  private subscription: Subscription;

  private totalPrice: number;
  constructor(private addCartBroker: AddCartBroker) {
    this.cartList = new Array<CartEntry>();

    this.subscription = this.addCartBroker.getSubscription().subscribe(value => {
        console.log(`Add to cart ${value}`);
        this.addCartEntry(value);
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.subscription) { this.subscription.unsubscribe(); }
  }

  private addCartEntry(productData: ProductData) {
    const existedIdx: number = this.cartList.findIndex(
        function (obj) {
            return obj.code === productData.code;
        }
    );

    // Not existing
    if (existedIdx === -1) {
        this.cartList.push(
            {code: productData.code, name: productData.name, price: productData.price, qty: 1}
        );
    } else {
        this.cartList[existedIdx].qty++;
    }

    this.calculateTotalPrice();
  }

  private calculateTotalPrice(): void {
    let total = 0;

    for (const entry of this.cartList) {
        total += entry.price * entry.qty;
    }

    this.totalPrice = total;
  }

}
