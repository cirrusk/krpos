import { Component, OnInit, Renderer2, ElementRef, ViewChildren, QueryList, OnDestroy, Input, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Modal, Logger, StorageService, SpinnerService } from '../../core';
import {
  PromotionOrderComponent, EtcOrderComponent,
  SearchAccountComponent, PickupOrderComponent,
  CancelCartComponent
} from '../../modals';
import { Accounts, OrderHistoryList, MemberType, AmwayExtendedOrdering } from '../../data';
import { Cart } from '../../data/models/order/cart';
import { ComplexPaymentComponent } from '../../modals/payment/complex-payment/complex-payment.component';
import { CouponComponent } from '../../modals/payment/ways/coupon/coupon.component';
import { SearchAccountBroker } from '../../broker';
import { PaymentService } from '../../service';

@Component({
  selector: 'pos-order-menu',
  templateUrl: './order-menu.component.html'
})
export class OrderMenuComponent implements OnInit, OnDestroy {
  hasAccount = false;
  hasProduct = false;
  hasCart = false;
  private orderInfoSubscribetion: Subscription;
  private couponsubscription: Subscription;
  private accountInfo: Accounts;
  private cartInfo: Cart;
  private amwayExtendedOrdering: AmwayExtendedOrdering;
  private orderType: string;
  @Input() promotionList: any;
  @ViewChildren('menus') menus: QueryList<ElementRef>;
  @Output() public posMenu: EventEmitter<any> = new EventEmitter<any>();      // 메뉴에서 이벤트를 발생시켜 카트컴포넌트에 전달
  @Output() public posPromotion: EventEmitter<any> = new EventEmitter<any>(); // 프로모션 팝업에서 제품코드를 받아 카트 컴포넌트에 전달
  @Output() public posPytoCafe: EventEmitter<any> = new EventEmitter<any>();      // 파이토 카페 선택 시 카트컴포넌트에 전달
  constructor(private modal: Modal,
    private storage: StorageService,
    private payment: PaymentService,
    private spinner: SpinnerService,
    private logger: Logger,
    private searchAccountBroker: SearchAccountBroker,
    private renderer: Renderer2
  ) {
    this.init();
  }

  ngOnInit() { }

  ngOnDestroy() {
    if (this.orderInfoSubscribetion) { this.orderInfoSubscribetion.unsubscribe(); }
    if (this.couponsubscription) { this.couponsubscription.unsubscribe(); }
  }

  init() {
    this.orderType = '';
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
        } else {
          this.orderType = '';
          this.cartInfo = null;
          this.amwayExtendedOrdering = data.data;
        }
      } else if (data.type === 'product') {
        if (this.orderType !== 'g') {
          this.hasProduct = data.flag;
        }
        if (data.data) {
          // this.account = data.data;
        }
      } else if (data.type === 'cart') {
        this.hasCart = data.flag;
        if (data.data) {
          this.cartInfo = data.data;
        } else {
          this.cartInfo = null;
        }
      } else if (data.type === 'group') {
        if (data.data) {
          this.amwayExtendedOrdering = data.data;
          this.hasProduct = !this.amwayExtendedOrdering.orderList.some(function (order) {
            return order.entries.length === 0;
          });
        } else {
          this.amwayExtendedOrdering = data.data;
        }
      }
    }
    if (this.hasAccount && this.hasProduct) {
      this.menus.forEach(menu => {
        this.renderer.removeClass(menu.nativeElement, 'on');
      });
      this.renderer.addClass(this.menus.first.nativeElement, 'on');
    }
  }

  /**
   * 통합 결제 팝업
   * @param evt
   */
  complexPayment(evt: any) {
    if (!this.hasAccount || !this.hasProduct) { return; }
    this.checkClass(evt);
    this.posMenu.emit({ type: '통합결제' });
    this.storage.setLocalItem('apprtype', 'c');
    if (this.orderType === 'g') { this.transformCartInfo(this.amwayExtendedOrdering); }
    if (this.accountInfo.accountTypeCode === MemberType.ABO) {
      this.spinner.show();
      // 쿠폰이 없으면 바로 결제화면, 에러날 경우라도 결제화면은 띄워주어야함.
      this.couponsubscription = this.payment.searchCoupons(this.accountInfo.uid, this.accountInfo.parties[0].uid, 0, 5).subscribe(
        result => {
          const couponlist = result.coupons;
          if (couponlist.length > 0) {
            this.popupCoupon();
          } else {
            this.popupPayment();
          }
        },
        error => { this.spinner.hide(); this.popupPayment(); this.logger.set('order.menu.component', `${error}`).error(); },
        () => { this.spinner.hide(); });
    } else {
      this.popupPayment();
    }
  }

  /**
   * 쿠폰 팝업
   */
  private popupCoupon() {
    this.modal.openModalByComponent(CouponComponent, {
      callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo, amwayExtendedOrdering: this.amwayExtendedOrdering },
      closeByClickOutside: false,
      modalId: 'CouponComponent'
    });
  }

  /**
   * 결제 팝업
   */
  private popupPayment() {
    this.modal.openModalByComponent(ComplexPaymentComponent, {
      callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo, amwayExtendedOrdering: this.amwayExtendedOrdering },
      closeByClickOutside: false,
      modalId: 'ComplexPaymentComponent_Od'
    }).subscribe(result => {
      if (!result) {
        this.storage.removePaymentModeCode();
        this.storage.removePay();
      }
    });
  }

  /**
   * 그룹 결제 사용자 검색 팝업
   * parameter 로 orderType 을 넘겨서 그룹 결제일 경우 활용하도록 함.
   * orderType = 'g' 그룹 결제
   * orderType = 'n' 일반 결제
   *
   * @param evt
   */
  groupPayment(evt: any) {
    this.checkClass(evt);
    this.modal.openModalByComponent(SearchAccountComponent, {
      closeByClickOutside: false,
      orderType: 'g',
      modalId: 'SearchAccountComponent'
    }).subscribe(result => {
      if (result) {
        this.orderType = 'g';
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
    this.modal.openModalByComponent(PickupOrderComponent, {
      title: 'ECP픽업 주문리스트',
      callerData: { searchType: 'p' },
      closeByClickOutside: true,
      modalId: 'PickupOrderComponent'
    });
  }

  /**
   * 구매 취소
   *
   * @param evt
   */
  cancelOrder(evt: any) {
    if (!this.hasAccount) { return; }
    // this.checkClass(evt);
    this.modal.openModalByComponent(CancelCartComponent, {
      actionButtonLabel: '확인',
      closeButtonLabel: '취소',
      closeByClickOutside: true,
      modalId: 'CancelCartComponent'
    });
  }

  /**
   * 프로모션
   *
   * @param evt
   */
  promotionOrder(evt: any) {
    if (!this.hasAccount) { return; }
    this.modal.openModalByComponent(PromotionOrderComponent, {
      closeByClickOutside: false,
      modalId: 'PromotionOrderComponent'
    }).subscribe(result => {
      if (result) {
        this.posPromotion.emit({ product: result });
      }
    });
  }

  /**
   * 기타
   *
   * @param evt
   */
  etcOrder(evt: any) {
    // if (!this.hasAccount) { return; }
    this.checkClass(evt);
    if (!this.hasAccount) { this.accountInfo = null; }
    this.modal.openModalByComponent(EtcOrderComponent, {
      callerData: { accountInfo: this.accountInfo },
      closeByClickOutside: false,
      modalId: 'EtcOrderComponent'
    }).subscribe(result => {
      if (result && result === 'pyt') {
        this.posPytoCafe.emit({ pytocafe: true });
      }
    });
  }

  private checkClass(evt: any) {
    evt.stopPropagation();
    this.menus.forEach(menu => {
      this.renderer.removeClass(menu.nativeElement, 'on');
    });
    this.renderer.addClass(evt.target, 'on');
  }

  private transformCartInfo(amwayExtendedOrdering: AmwayExtendedOrdering) {
    const jsonData = {
      'user': amwayExtendedOrdering.orderList[0].user,
      'totalPrice': amwayExtendedOrdering.totalValue,
      'code': amwayExtendedOrdering.orderList[0].code
    };
    Object.assign(this.cartInfo, jsonData);
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
