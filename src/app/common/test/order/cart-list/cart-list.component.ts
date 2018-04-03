import { CartEntry } from './../../../../data/models/cart-entry';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AddCartBroker } from './../../../../broker/cart/addcart.broker';
// import { CartEntry } from './../../../../interface/cartentry.interface';


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


    });
  }

  ngOnInit() {
  }
  private addCartEntry() {

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private calculateTotalPrice(): void {
    let total = 0;

    for (const entry of this.cartList) {
        total += entry.price * entry.qty;
    }

    this.totalPrice = total;
  }

}
