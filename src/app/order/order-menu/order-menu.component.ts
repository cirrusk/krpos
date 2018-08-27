import { Component, OnInit, Renderer2, ElementRef, ViewChildren, QueryList, OnDestroy, Input, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Modal, Logger, StorageService } from '../../core';
import {
  PromotionOrderComponent, EtcOrderComponent,
  SearchAccountComponent, PickupOrderComponent,
  CancelCartComponent,
  SearchBerComponent
} from '../../modals';
import { Accounts, MemberType, AmwayExtendedOrdering, OrderType, ModelType, ModalIds } from '../../data';
import { Cart } from '../../data/models/order/cart';
import { ComplexPaymentComponent } from '../../modals/payment/complex-payment/complex-payment.component';
import { CouponComponent } from '../../modals/payment/ways/coupon/coupon.component';
import { SearchAccountBroker, InfoBroker } from '../../broker';
import { PaymentService } from '../../service';

/**
 * 주문 메뉴 구성
 *
 * 통합결제
 *    초기 비활성화
 *    회원 조회 시 활성화
 *    클릭 시 쿠폰이 있는지 먼저 체크하고 있으면 쿠폰 화면을 먼저 띄우고 진행
 *
 * 그룹주문
 *    초기 활성화
 *    그룹주문을 선택하기 위한 회원 검색팝업화면
 *
 * 픽업주문
 *    초기 활성화
 *
 * 주문취소
 *    초기 비활성화
 *    회원 조회 시 활성화
 *
 * 프로모션 상품
 *    초기 비활성화
 *    회원 조회 시 활성화
 *
 * 기타
 *    초기 활성화
 *    사업자등록증 조회의 경우는 회원 조회시 검색가능함.
 *
 */
@Component({
  selector: 'pos-order-menu',
  templateUrl: './order-menu.component.html'
})
export class OrderMenuComponent implements OnInit, OnDestroy {
  hasAccount = false;
  hasProduct = false;
  hasCart = false;
  isABO = false;
  orderType: string;
  accountInfo: Accounts;
  memberType = MemberType;
  private orderInfoSubscribetion: Subscription;
  private couponsubscription: Subscription;
  private cartInfo: Cart;
  private amwayExtendedOrdering: AmwayExtendedOrdering;
  @Input() promotionList: any;
  @ViewChildren('menus') menus: QueryList<ElementRef>;
  @Output() public posMenu: EventEmitter<any> = new EventEmitter<any>();      // 메뉴에서 이벤트를 발생시켜 카트컴포넌트에 전달
  @Output() public posPromotion: EventEmitter<any> = new EventEmitter<any>(); // 프로모션 팝업에서 제품코드를 받아 카트 컴포넌트에 전달
  @Output() public posPytoCafe: EventEmitter<any> = new EventEmitter<any>();  // 파이토 카페 선택 시 카트컴포넌트에 전달
  @Output() public posBer: EventEmitter<any> = new EventEmitter<any>();       // 중개주문 팝업에서 사업자 선택시 카트 컴포넌트에 전달
  @Output() public posPayReset: EventEmitter<any> = new EventEmitter<any>();  // 통합결제 창이 닫힐 경우 결과 금액 초기화하기
  constructor(private modal: Modal,
    private storage: StorageService,
    private payment: PaymentService,
    private logger: Logger,
    private searchAccountBroker: SearchAccountBroker,
    private infobroker: InfoBroker,
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
   * @param {any} data 보내준 데이터
   */
  setFlag(data) {
    if (data) {
      this.logger.set('order.menu.component', `from cart list to cart menu flag receive, type : ${data.type}`).debug();
      if (data.type === ModelType.ACCOUNT) {
        this.hasAccount = data.flag;
        if (data.data) {
          this.accountInfo = data.data;
          if (this.accountInfo.accountTypeCode === MemberType.ABO) { this.isABO = true; }
        } else {
          this.orderType = '';
          this.cartInfo = null;
          this.isABO = false;
          this.amwayExtendedOrdering = data.data;
        }
      } else if (data.type === ModelType.PRODUCT) {
        if (this.orderType !== OrderType.GROUP) {
          this.hasProduct = data.flag;
        }
        if (data.data) {
          // this.account = data.data;
        }
      } else if (data.type === ModelType.CART) {
        this.hasCart = data.flag;
        if (data.data) {
          this.cartInfo = data.data;
        } else {
          this.cartInfo = null;
        }
      } else if (data.type === ModelType.GROUP) {
        if (data.data) {
          if (this.orderType === '') {
            this.orderType = OrderType.GROUP;
          }
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
   * 키보드 이벤트 컴포넌트의 이벤트를 받아 처리
   *
   * @param data 키보드 이벤트
   */
  doAction(data: any) {
    if (data) {
      const action = data.action;
      if (action === 'pickup') {
        this.pickupOrder(event, action);
      } else if (action === 'ordercancel') {
        this.cancelOrder(event, action);
      } else if (action === 'grouporder') {
        this.groupPayment(event, action);
      } else if (action === 'mediator') {
        this.mediateOrder(event, action);
      } else if (action === 'etc') {
        this.etcOrder(event, action);
      } else {
        this.checkPopupPayment(action);
      }

    }
  }

  private checkPopupPayment(action: string) {
    if (action === 'card') {
      this.complexAndPayPopup('card');
    } else if (action === 'ic') {
      this.complexAndPayPopup('ic');
    } else if (action === 'point') {
      this.complexAndPayPopup('point');
    } else if (action === 'debit') {
      this.complexAndPayPopup('debit');
    } else if (action === 'recash') {
      this.complexAndPayPopup('recash');
    } else if (action === 'cash') {
      this.complexAndPayPopup('cash');
    } else if (action === 'cheque') {
      this.complexAndPayPopup('cheque');
    }
  }

  private complexAndPayPopup(addPopupType: string) {
    if (this.storage.alreadyOpenModal(ModalIds.COMPLEX)) { // 해당 팝업만 띄움
      this.infobroker.sendInfo('popup', addPopupType);
    } else {
      if (addPopupType === 'point') {
        if (this.accountInfo.accountTypeCode === MemberType.ABO) { addPopupType = 'apoint'; }
        if (this.accountInfo.accountTypeCode === MemberType.MEMBER) { addPopupType = 'mpoint'; }
      }
      this.complexPayment(event, addPopupType);
      this.checkClassById('complexPayment');
    }
  }

  /**
   * 통합 결제 팝업
   * 쿠폰이 없으면 바로 결제화면, 에러날 경우라도 결제화면은 띄워주어야함.
   * @param {any} evt 이벤트
   */
  complexPayment(evt: any, addPopupType?: string) {
    if (!this.hasAccount || !this.hasProduct) { return; }
    this.checkClass(evt);
    this.posMenu.emit({ type: '통합결제' });
    this.storage.setLocalItem('apprtype', 'c');
    if (this.orderType === OrderType.GROUP) { this.transformCartInfo(this.amwayExtendedOrdering); }
    if (this.accountInfo.accountTypeCode === MemberType.ABO) {
      // 쿠폰이 없으면 바로 결제화면, 에러날 경우라도 결제화면은 띄워주어야함.
      this.couponsubscription = this.payment.searchCoupons(this.accountInfo.uid, this.accountInfo.parties[0].uid, 0, 5).subscribe(
        result => {
          const couponlist = result.coupons;
          if (couponlist.length > 0) {
            this.popupCoupon(addPopupType);
          } else {
            this.popupPayment(addPopupType);
          }
        },
        error => { this.popupPayment(); this.logger.set('order.menu.component', `${error}`).error(); });
    } else {
      this.popupPayment(addPopupType);
    }
  }

  /**
   * 쿠폰 팝업
   */
  private popupCoupon(addPopupType?: string) {
    this.modal.openModalByComponent(CouponComponent, {
      callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo, amwayExtendedOrdering: this.amwayExtendedOrdering, addPopupType: addPopupType },
      closeByClickOutside: false,
      modalId: ModalIds.COUPON
    });
  }

  /**
   * 결제 팝업
   */
  private popupPayment(addPopupType?: string) {
    this.modal.openModalByComponent(ComplexPaymentComponent, {
      callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo, amwayExtendedOrdering: this.amwayExtendedOrdering, addPopupType: addPopupType },
      closeByClickOutside: false,
      closeByEscape: false,
      modalId: ModalIds.COMPLEX
    }).subscribe(result => {
      this.posPayReset.emit({ reset: true });
      if (!result) {
        this.storage.removePaymentModeCode();
        this.storage.removePaymentCapture();
        this.storage.removePay();
      }
    });
  }

  /**
   * 그룹 결제 사용자 검색 팝업
   * parameter 로 orderType 을 넘겨서 그룹 결제일 경우 활용하도록 함.
   * orderType = 'G' 그룹 결제
   * orderType = 'N' 일반 결제
   *
   * @param {any} evt 이벤트
   */
  groupPayment(evt: any, action?: string) {
    if (action) {
      const modals = this.storage.getAllModalIds();
      if (modals && modals.indexOf(ModalIds.ACCOUNT) !== -1) {
        return;
      }
      this.checkClassById('groupPayment');
    } else {
      this.checkClass(evt);
    }
    const modalData = this.storage.getLatestModalId();
    if (modalData != null) {
      this.modal.getModalArray().forEach(m => {
        this.modal.clearAllModals(m);
      });
    }
    this.modal.openModalByComponent(SearchAccountComponent, {
      closeByClickOutside: false,
      orderType: OrderType.GROUP,
      modalId: ModalIds.ACCOUNT
    }).subscribe(result => {
      if (result) {
        this.orderType = OrderType.GROUP;
        this.searchAccountBroker.sendInfo(OrderType.GROUP, result);
      }
    });
  }

  /**
   * 픽업 오더 팝업
   *
   * @param {any} evt 이벤트
   */
  pickupOrder(evt: any, action?: string) {
    if (action) {
      const modals = this.storage.getAllModalIds();
      if (modals && modals.indexOf(ModalIds.PICKUP) !== -1) {
        return;
      }
      this.checkClassById('pickupOrder');
    } else {
      this.checkClass(evt);
    }
    const modalData = this.storage.getLatestModalId();
    if (modalData != null) {
      this.modal.getModalArray().forEach(m => {
        this.modal.clearAllModals(m);
      });
    }
    this.modal.openModalByComponent(PickupOrderComponent, {
      title: 'ECP픽업 주문리스트',
      callerData: { searchType: 'p' },
      closeByClickOutside: true,
      modalId: ModalIds.PICKUP
    });
  }

  /**
   * 중개 주문 팝업
   * 중개 주문은 ABO만 할 수 있음.
   *
   *
   * @param {any} evt 이벤트
   */
  mediateOrder(evt: any, action?: string) {
    if (!this.hasAccount || this.orderType === OrderType.GROUP) { return; }
    if (this.accountInfo && this.accountInfo.accountTypeCode !== MemberType.ABO) { return; }
    if (action) {
      const modals = this.storage.getAllModalIds();
      if (modals && modals.indexOf(ModalIds.BERSEARCH) !== -1) {
        return;
      }
      this.checkClassById('mediateOrder');
    } else {
      this.checkClass(evt);
    }
    this.modal.openModalByComponent(SearchBerComponent, {
      callerData: { aboNum: this.accountInfo.uid },
      actionButtonLabel: '확인',
      closeButtonLabel: '취소',
      closeByClickOutside: false,
      modalId: ModalIds.BERSEARCH
    }).subscribe(result => {
      if (result) {
        this.posBer.emit({ ber: result });
      }
    });
  }

  /**
   * 중개주문 메뉴 비활성화 처리
   */
  checkMediateDisable(): boolean {
    if (!this.hasAccount || this.orderType === OrderType.GROUP) { return true; }
    if (this.accountInfo && this.accountInfo.accountTypeCode !== MemberType.ABO) { return true; }
    return false;
  }

  /**
   * 구매 취소
   *
   * @param {any} evt 이벤트
   */
  cancelOrder(evt: any, action?: string) {
    if (!this.hasAccount) { return; }
    if (action) {
      const modals = this.storage.getAllModalIds();
      if (modals && modals.indexOf(ModalIds.CANCELCART) !== -1) {
        return;
      }
      this.checkClassById('cancelOrder');
    } else {
      this.checkClass(evt);
    }
    this.modal.openModalByComponent(CancelCartComponent, {
      actionButtonLabel: '확인',
      closeButtonLabel: '취소',
      closeByEnter: true,
      closeByClickOutside: true,
      beforeCloseCallback: function () {
        if (this.isEnter) {
          this.result = this.isEnter;
        }
      },
      modalId: ModalIds.CANCELCART
    }).subscribe(result => {
      if (result) {
        this.isABO = false;
      }
    });
  }

  /**
   * 프로모션
   *
   * @param {any} evt 이벤트
   */
  promotionOrder(evt: any) {
    if (!this.hasAccount) { return; }
    this.modal.openModalByComponent(PromotionOrderComponent, {
      closeByClickOutside: false,
      modalId: ModalIds.PROMOTION
    }).subscribe(result => {
      if (result) {
        this.posPromotion.emit({ product: result });
      }
    });
  }

  /**
   * 기타
   *
   * @param {any} evt 이벤트
   */
  etcOrder(evt: any, action?: string) {
    // if (!this.hasAccount) { return; }
    if (this.hasProduct && this.hasCart) { return; }
    if (action) {
      const modals = this.storage.getAllModalIds();
      if (modals && modals.indexOf(ModalIds.ETC) !== -1) {
        return;
      }
      this.checkClassById('etcOrder');
    } else {
      this.checkClass(evt);
    }
    if (!this.hasAccount) { this.accountInfo = null; }
    this.modal.openModalByComponent(EtcOrderComponent, {
      callerData: { accountInfo: this.accountInfo },
      closeByClickOutside: false,
      modalId: ModalIds.ETC
    }).subscribe(result => {
      if (result && result === 'pyt') {
        this.posPytoCafe.emit({ pytocafe: true });
      }
    });
  }

  /**
   * 선택 row 활성화
   * @param {any} evt 이벤트
   */
  private checkClass(evt: any) {
    evt.stopPropagation();
    this.menus.forEach(menu => {
      this.renderer.removeClass(menu.nativeElement, 'on');
    });
    this.renderer.addClass(evt.target, 'on');
  }

  private checkClassById(id: string) {
    this.menus.forEach(menu => {
      this.renderer.removeClass(menu.nativeElement, 'on');
    });
    const $this = this.menus.find(menu => menu.nativeElement.getAttribute('id') === id).nativeElement;
    this.renderer.addClass($this, 'on');
  }

  /**
   * 장바구니정보 생성
   *  - 그룹주문의 경우 cartInfo 를 생성하여 결제 진행함.
   * @param {AmwayExtendedOrdering} amwayExtendedOrdering 그룹주문
   */
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
