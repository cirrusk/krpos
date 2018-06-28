import { Component, OnInit, Renderer2, ElementRef, ViewChildren, QueryList, OnDestroy, Input } from '@angular/core';
import { Modal, Logger, SpinnerService, AlertService, StorageService } from '../../core';
import { Subscription } from 'rxjs/Subscription';
import { PromotionOrderComponent, EtcOrderComponent,
  SearchAccountComponent, PickupOrderComponent, NormalPaymentComponent,
  CancelCartComponent } from '../../modals';
import { Accounts, OrderHistoryList, OrderEntry, MemberType } from '../../data';
import { OrderService, MessageService } from '../../service';
import { Utils } from '../../core/utils';
import { Router } from '@angular/router';
import { Cart } from '../../data/models/order/cart';
import { CouponCheckComponent } from '../../modals/payment/coupon-payment/coupon-check.component';
import { ComplexPaymentComponent } from '../../modals/payment/complex-payment/complex-payment.component';
import { SearchAccountBroker } from '../../broker';

@Component({
  selector: 'pos-order-menu',
  templateUrl: './order-menu.component.html'
})
export class OrderMenuComponent implements OnInit, OnDestroy {
  private orderInfoSubscribetion: Subscription;
  private accountInfo: Accounts;
  private cartInfo: Cart;
  private orderInfoList: OrderHistoryList;
  hasAccount = false;
  hasProduct = false;
  hasCart = false;
  @Input() promotionList: any;
  @ViewChildren('menus') menus: QueryList<ElementRef>;
  constructor(private modal: Modal,
              private storage: StorageService,
              private logger: Logger,
              private searchAccountBroker: SearchAccountBroker,
              private renderer: Renderer2
              ) { }

  ngOnInit() { }

  ngOnDestroy() {
    if (this.orderInfoSubscribetion) { this.orderInfoSubscribetion.unsubscribe(); }
  }

  /**
   * cart list 에서 보내준 이벤트를 받음
   *
   * @param data 보내준 데이터
   */
  setFlag(data) {
    if (data) {
      this.logger.set('order.menu.component', `from cart list to cart menu flag receive, type : ${data.type}`).debug();
      if (data.type === 'account') {
        this.hasAccount = data.flag;
        if (data.data) {
          this.accountInfo = data.data;
        }
      } else if (data.type === 'product') {
        this.hasProduct = data.flag;
        if (data.data) {
          // this.account = data.data;
        }
      } else if (data.type === 'cart') {
        this.hasCart = data.flag;
        if (data.data) {
          this.cartInfo = data.data;
        }
      }
    }
  }

  /**
   * 일반 결제 팝업
   *
   * @param evt
   */
  normalPayment(evt: any) {
    if (!this.hasAccount || !this.hasProduct) { return; }
    this.checkClass(evt);
    this.modal.openModalByComponent(NormalPaymentComponent,
      {
        callerData : {accountInfo: this.accountInfo, cartInfo: this.cartInfo},
        closeByClickOutside: false,
        modalId: 'NormalPaymentComponent'
      }
    );
  }

  /**
   * 복합 결제 팝업
   * @param evt
   */
  complexPayment(evt: any) {
    if (!this.hasAccount || !this.hasProduct) { return; }
    this.checkClass(evt);

    if (this.accountInfo.accountTypeCode === MemberType.ABO) {
      this.modal.openModalByComponent(CouponCheckComponent,
        {
          callerData : {accountInfo: this.accountInfo, cartInfo: this.cartInfo},
          closeByClickOutside: false,
          closeByEnter: false,
          modalId: 'CouponCheckComponent'
        }
      );
    } else {
      this.modal.openModalByComponent(ComplexPaymentComponent,
        {
          callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo },
          closeByClickOutside: false,
          closeByEnter: false,
          closeByEscape: false,
          modalId: 'ComplexPaymentComponent_Od'
        }
      ).subscribe(result => {
        if (!result) { this.storage.removePaymentModeCode(); }
      });
    }
  }

  /**
   * 그룹 결제 사용자 검색 팝업
   * parameter 로 paymentType 을 넘겨서 그룹 결제일 경우 활용하도록 함.
   * paymentType = 'g' 그룹 결제
   * paymentType = 'n' 일반 결제
   *
   * @param evt
   */
  groupPayment(evt: any) {
    this.checkClass(evt);
    this.modal.openModalByComponent(SearchAccountComponent,
      {
        closeByClickOutside: false,
        paymentType: 'g',
        modalId: 'SearchAccountComponent'
      }
    ).subscribe(result => {
      if (result) {
        this.searchAccountBroker.sendInfo('g', result);
      }
    });
  }

  /**
   * 픽업 오더 팝업
   *
   * @param evt
   */
  pickupOrder(evt: any) {
    this.checkClass(evt);
    this.modal.openModalByComponent(PickupOrderComponent,
      {
        title: 'ECP픽업 주문리스트',
        callerData : {searchType : 'p'},
        closeByClickOutside: true,
        modalId: 'PickupOrderComponent'
      }
    );
  }

  /**
   * 구매 취소
   *
   * @param evt
   */
  cancelOrder(evt: any) {
    if (!this.hasAccount) { return; }
    // this.checkClass(evt);
    this.modal.openModalByComponent(CancelCartComponent,
      {
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        closeByClickOutside: true,
        modalId: 'CancelCartComponent'
      }
    );
  }

  /**
   * 프로모션
   *
   * @param evt
   */
  promotionOrder(evt: any) {
    if (!this.hasAccount) { return; }
    // this.checkPromotionClass(evt);
    this.modal.openModalByComponent(PromotionOrderComponent,
      {
        closeByClickOutside: false,
        modalId: 'PromotionOrderComponent'
      }
    );
  }

  /**
   * 기타
   *
   * @param evt
   */
  etcOrder(evt: any) {
    // if (!this.hasAccount) { return; }
    // this.checkClass(evt);
    this.modal.openModalByComponent(EtcOrderComponent,
      {
        callerData: {accountInfo: this.accountInfo},
        closeByClickOutside: false,
        modalId: 'EtcOrderComponent'
      }
    );
  }

  private checkClass(evt: any) {
    evt.stopPropagation();
    this.menus.forEach(menu => {
      // this.renderer.removeClass(menu.nativeElement, 'blue');
      this.renderer.removeClass(menu.nativeElement, 'on');
    });
    // this.renderer.addClass(evt.target, 'blue');
    this.renderer.addClass(evt.target, 'on');
  }

  // private checkPromotionClass(evt: any) {
  //   evt.stopPropagation();
  //   this.menus.forEach(menu => {
  //     // this.renderer.removeClass(menu.nativeElement, 'blue');
  //     this.renderer.removeClass(menu.nativeElement, 'on');
  //   });
  //   this.renderer.addClass(evt.target, 'on');
  // }
}
