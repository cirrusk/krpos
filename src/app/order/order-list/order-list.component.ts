import { AddCartBroker } from './../../broker/order/cart/add-cart.broker';
import { Product } from './../../data/models/product';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartEntry } from '../../data/models/order/cart-entryt';
import { CartModification } from '../../data/models/order/cart-modification';
import { OrderEntry } from '../../data/models/order/order-entry';
import { ProductInfo } from '../../data/models/order/product-info';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'pos-order-list',
  templateUrl: './order-list.component.html'
})
export class OrderListComponent implements OnInit, OnDestroy {
  private cartList: Array<CartEntry>;
  private subscription: Subscription;

  constructor(private addCartBroker: AddCartBroker) {
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
