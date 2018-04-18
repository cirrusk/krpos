import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AddCartBroker } from '../../broker/order/cart/add-cart.broker';
import { Product, CartEntry, CartModification, OrderEntry, ProductInfo } from '../../data/model';
import { Logger } from '../../service/pos';
import { PagerService } from '../../service/common/pager.service';


@Component({
  selector: 'pos-order-list',
  templateUrl: './order-list.component.html'
})
export class OrderListComponent implements OnInit, OnDestroy {
  private cartList: CartEntry[];
  private addCartsubscription: Subscription;
  private currentCartList: CartEntry[];
  private currentPage: number;
  private pager: any = {};

  constructor(private addCartBroker: AddCartBroker,
              private logger: Logger,
              private pagerService: PagerService) {
    this.cartList = new Array<CartEntry>();
    this.addCartsubscription = this.addCartBroker.getInfo().subscribe(value => {
        this.logger.debug(`Add to cart ${value}`, 'order.list.component');
        this.addCartEntry(value);
      });
   }

  ngOnInit() {
  }
  ngOnDestroy() {
    this.addCartsubscription.unsubscribe();
  }

  // 주문 리스트 추가
  private addCartEntry(cartEntry: CartEntry) {
    const existedIdx: number = this.cartList.findIndex(
      function (obj) {
        return obj.code === cartEntry.code;
      }
    );

    // 리스트에 없을 경우
    if (existedIdx === -1) {
      this.cartList.push(
          {code: cartEntry.code, name: cartEntry.name, qty: 1, price: cartEntry.price, desc: cartEntry.desc}
      );
    } else {
        this.cartList[existedIdx].qty++;
    }

    this.setPage(Math.ceil(this.cartList.length / 10));

  }

  // test 를 위해 임시
  eventPopup(str: string) {
    let num = this.cartList.findIndex(function (obj) {
      return obj.code === str;
    });
    this.cartList.splice(num, 1);

    num = num <= this.cartList.length ? num + 1 : num - 1;
    this.setPage(Math.ceil(num / 10));
  }

  setPage(page: number, pagerFlag: boolean = false) {
    if ((page < 1 || page > this.pager.totalPages) && pagerFlag) {
      return;
    }

    this.pager = this.pagerService.getPager(this.cartList.length, page);
    this.currentCartList = this.cartList.slice(this.pager.startIndex, this.pager.endIndex + 1);
  }
}
