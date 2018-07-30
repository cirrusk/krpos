import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from '../core';
import { CartListComponent } from './cart-list/cart-list.component';
import { Accounts } from '../data';

@Component({
  selector: 'pos-order',
  templateUrl: './order.component.html'
})
export class OrderComponent implements OnInit {
  public noticeList: string[] = [];
  public promotionList: any[] = [];
  @ViewChild(CartListComponent) cartList: CartListComponent;
  constructor(private storage: StorageService, private route: ActivatedRoute) { }

  ngOnInit() {
    // 장바구니 추가 시 클라이언트에 장바구니 데이터 전송
    // 빈값을 한번 던져서 최초 이벤트를 발생시킴.
    this.storage.setOrderEntry(null);
    // resolver 에서 전달해준 값을 받아 cart list에 전달하여 공지사항 출력
    const data = this.route.snapshot.data['notice'];
    // 일반 공지
    this.noticeList = data[0];
    // resolver 에서 전달해준 값을 받아 cart menu에 전달하여 프로모션 출력
    // api 가 다른 경우 resolver를 하나 더 만듬.
    // 프로모션 공지
    this.promotionList = data[1];
  }

  isCheck(): boolean {
    const accountInfo: Accounts = this.cartList.accountInfo;
    const groupAccountInfo: Array<Accounts> = this.cartList.groupAccountInfo;
    const cartList = this.cartList.cartList;
    let check = true;
    if (accountInfo !== null) {
      check = false;
    }
    if (groupAccountInfo && groupAccountInfo.length > 0) {
      check = false;
    }
    if (cartList && cartList.length > 0) {
      check = false;
    }
    return check;
  }
}
