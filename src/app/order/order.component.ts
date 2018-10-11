import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { chunk } from 'lodash';

import { StorageService } from '../core';
import { Accounts, PromotionViews, PromotionItems, PromotionList, PromotionData } from '../data';
import { CartListComponent } from './cart-list/cart-list.component';

/**
 * 주문 메인 화면
 *
 * 프로모션 공지 변경사항
 * 기존 프로모션 공지사항 데이터 출력에서
 * 상품 검색 시 주문레벨의 프로모션 데이터를 받아
 * 화면에 출력하도록 변경
 */
@Component({
  selector: 'pos-order',
  templateUrl: './order.component.html'
})
export class OrderComponent implements OnInit {
  public noticeList: string[] = [];
  public promotionViews: PromotionViews;
  @ViewChild(CartListComponent) cartList: CartListComponent;
  constructor(private storage: StorageService, private route: ActivatedRoute) { }

  ngOnInit() {
    // 장바구니 추가 시 클라이언트에 장바구니 데이터 전송
    // 빈값을 한번 던져서 최초 이벤트를 발생시킴.
    this.storage.setOrderEntry(null);
    // resolver 에서 전달해준 값을 받아 cart list에 전달하여 공지사항 출력
    const data = this.route.snapshot.data['notice'];
    // 일반 공지
    this.noticeList = data;
    // resolver 에서 전달해준 값을 받아 cart menu에 전달하여 프로모션 출력
    // api 가 다른 경우 resolver를 하나 더 만듬.
    // 프로모션 공지 변경 : 프로모션 공지사항에서 주문레벨 프로모션으로 변경
    this.promotionViews = new PromotionViews(); // 초기화
  }

  /**
   * 카트에서 상품 검색 시 프로모션이 있을 경우
   * 주문 레벨 프로모션인 경우 해당 프로모션 정보를 전달받아 설정함.
   *
   * @param data 주문 레벨 프로모션
   */
  updatePromotion(data) {
    if (data && data.promotions) {
      const promotionItems: Array<PromotionItems> = new Array<PromotionItems>();
      const orderpromotions: PromotionList[] = data.promotions;
      if (orderpromotions && orderpromotions.length > 0) {
        let promotion: PromotionItems;
        chunk(orderpromotions, 2).forEach(p => {
          if (p.length === 2) {
            const nm0 = p[0].promotion.name ? p[0].promotion.name : p[0].promotion.description;
            const nm1 = p[1].promotion.name ? p[1].promotion.name : p[1].promotion.description;
            const p1 = new PromotionData(nm0, p[0].description);
            const p2 = new PromotionData(nm1, p[1].description);
            promotion = new PromotionItems(p1, p2);
            promotionItems.push(promotion);
          } else {
            const nm0 = p[0].promotion.name ? p[0].promotion.name : p[0].promotion.description;
            const p1 = new PromotionData(nm0, p[0].description);
            promotion = new PromotionItems(p1, null);
            promotionItems.push(promotion);
          }
        });
        this.promotionViews = new PromotionViews(promotionItems);
      }
    } else {
      this.promotionViews = null;
    }
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
