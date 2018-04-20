import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AddCartBroker } from '../../broker/order/cart/add-cart.broker';
import { Product, CartEntry, CartModification, OrderEntry, ProductInfo } from '../../data/model';
import { Logger } from '../../service/pos';
import { PagerService } from '../../service/common/pager.service';

// @Component({
//   selector: 'pos-order-list',
//   templateUrl: './order-list.component.html'
// })
export class OrderListComponent implements OnInit, OnDestroy {
  private cartList: Array<CartEntry>;         // 장바구니 리스트
  private addCartsubscription: Subscription;
  private currentCartList: CartEntry[];       // 출력 장바구니 리스트
  private currentPage: number;                // 현재 페이지 번호
  private pager: any = {};                    // pagination 정보

  constructor(private addCartBroker: AddCartBroker,
              private logger: Logger,
              private pagerService: PagerService) {
    this.cartList = new Array<CartEntry>();

    this.addCartsubscription = this.addCartBroker.getInfo().subscribe(value => {
        this.logger.set({n: 'order.list.component', m: `Add to cart ${value}`}).debug();
        // 장바구니에 담을 정보
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
          {entryNumber: cartEntry.entryNumber,
           code: cartEntry.code,
           name: cartEntry.name,
           qty: 1,
           price: cartEntry.price,
           desc: cartEntry.desc}
      );
    } else {
        this.cartList[existedIdx].qty++;
    }

    // 장바구니에 추가한 페이지로 이동
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

  // 출력 데이터 생성
  setPage(page: number, pagerFlag: boolean = false) {
    if ((page < 1 || page > this.pager.totalPages) && pagerFlag) {
      return;
    }

    // pagination 생성 데이터 조회
    this.pager = this.pagerService.getPager(this.cartList.length, page);
    // 출력 리스트 생성
    this.currentCartList = this.cartList.slice(this.pager.startIndex, this.pager.endIndex + 1);
  }

}
