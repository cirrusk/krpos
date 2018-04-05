import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AddCartBroker } from '../../broker/order/cart/add-cart.broker';
import { Product, CartEntry, CartModification, OrderEntry, ProductInfo } from '../../data/model';

@Component({
  selector: 'pos-order-list',
  templateUrl: './order-list.component.html'
})
export class OrderListComponent implements OnInit, OnDestroy {
  private cartList: Array<CartEntry>;
  private subscription: Subscription;

  constructor(private addCartBroker: AddCartBroker) {
    this.cartList = new Array<CartEntry>();

    this.subscription = this.addCartBroker.getInfo().subscribe(value => {
      console.log(`Add to cart ${value}`);
      this.addCartEntry(value);
  });
   }

  ngOnInit() {
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private addCartEntry(cartEntry: CartEntry) {
    const existedIdx: number = this.cartList.findIndex(
      function (obj) {
        return obj.code === cartEntry.code;
      }
    );

    // Not existing
    if (existedIdx === -1) {
      this.cartList.push(
          {code: cartEntry.code, name: cartEntry.name, qty: 1, price: cartEntry.price, desc: cartEntry.desc}
      );
    } else {
        this.cartList[existedIdx].qty++;
    }
  }

}
