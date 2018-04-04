import { Product } from './../../data/models/product';
import { Component, OnInit } from '@angular/core';
import { CartEntry } from '../../data/models/order/cart-entryt';
import { CartModification } from '../../data/models/order/cart-modification';
import { OrderEntry } from '../../data/models/order/order-entry';
import { ProductInfo } from '../../data/models/order/product-info';

@Component({
  selector: 'pos-order-list',
  templateUrl: './order-list.component.html'
})
export class OrderListComponent implements OnInit {
  private cartList: Array<CartEntry>;

  constructor() { }

  ngOnInit() {
  }

  private addCartEntry(cartModification: CartModification) {
    let productInfo =  new ProductInfo();

    productInfo = cartModification.entry.product;
    const existedIdx: number = this.cartList.findIndex(
      function (obj) {
        return obj.code === productInfo.code;
      }
    );

    // Not existing
    if (existedIdx === -1) {
      this.cartList.push(
          {code: productInfo.code, name: productInfo.name, qty: 1, price: productInfo.price.value, desc: ''}
      );
    } else {
        this.cartList[existedIdx].qty++;
    }
  }

}
