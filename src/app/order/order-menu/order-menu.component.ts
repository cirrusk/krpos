import { Component, OnInit, Renderer2, ElementRef, ViewChildren, QueryList, OnDestroy, Input } from '@angular/core';
import { Modal, StorageService, Logger, SpinnerService, AlertService } from '../../core';
import { PromotionOrderComponent, EtcOrderComponent,
  SearchAccountComponent, PickupOrderComponent, NormalPaymentComponent,
  ComplexPaymentComponent, CancelOrderComponent } from '../../modals';
import { Accounts, OrderHistoryList } from '../../data';
import { OrderService, MessageService } from '../../service';
import { Utils } from '../../core/utils';
import { Router } from '@angular/router';

@Component({
  selector: 'pos-order-menu',
  templateUrl: './order-menu.component.html'
})
export class OrderMenuComponent implements OnInit, OnDestroy {
  private account: Accounts;
  private orderInfoList: OrderHistoryList;
  hasAccount = false;
  hasProduct = false;
  hasCart = false;
  @Input() promotionList: any[] = [];
  @ViewChildren('menus') menus: QueryList<ElementRef>;
  constructor(private modal: Modal,
              private storage: StorageService,
              private orderService: OrderService,
              private messageService: MessageService,
              private alert: AlertService,
              private spinner: SpinnerService,
              private logger: Logger,
              private element: ElementRef,
              private renderer: Renderer2,
              private router: Router
              ) { }

  ngOnInit() { }

  ngOnDestroy() { }

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
        this.account = data.data;
      } else if (data.type === 'product') {
        this.hasProduct = data.flag;
      } else if (data.type === 'cart') {
        this.hasCart = data.flag;
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
    this.modal.openModalByComponent(ComplexPaymentComponent,
      {
        closeByClickOutside: false,
        modalId: 'ComplexPaymentComponent'
      }
    );
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
    );
  }

  /**
   * 픽업 오더 팝업
   *
   * @param evt
   */
  pickupOrder(evt: any) {
    if (!this.hasAccount) { return; }
    this.checkClass(evt);

    this.getOrderInfo(this.account);
  }

  /**
   * 구매 취소
   *
   * @param evt
   */
  cancelOrder(evt: any) {
    if (!this.hasAccount || !this.hasCart) { return; }
    // this.checkClass(evt);
    this.modal.openModalByComponent(CancelOrderComponent,
      {
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        closeByClickOutside: true,
        modalId: 'CancelOrderComponent'
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
    if (!this.hasAccount) { return; }
    // this.checkClass(evt);
    this.modal.openModalByComponent(EtcOrderComponent,
      {
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

  private checkPromotionClass(evt: any) {
    evt.stopPropagation();
    this.menus.forEach(menu => {
      // this.renderer.removeClass(menu.nativeElement, 'blue');
      this.renderer.removeClass(menu.nativeElement, 'on');
    });
    this.renderer.addClass(evt.target, 'on');
  }

  private getOrderInfo(account: Accounts): void {
    if (account) {
      this.spinner.show();
      this.orderService.getOrderInfo('NO', account.uid, 'A').subscribe(
        orderInfo => {
          this.spinner.hide();
          this.orderInfoList = orderInfo;
          const orderCount = this.orderInfoList.orders.length;
          // 주문데이터가 없을때
          if (orderCount === 0) {
            this.modal.openConfirm(
              {
                title: 'ECP 컨펌/출력',
                message: this.messageService.get('noECPOrder'),
                actionButtonLabel: '확인',
                closeButtonLabel: '취소',
                closeByClickOutside: false,
                modalId: 'ORDERCONFIRM'
              }
            );
          // 주문데이터가 1 일때
          } else if (orderCount === 1) {
            this.modal.openModalByComponent(PickupOrderComponent,
              {
                callerData : {orderInfo : this.orderInfoList},
                closeByClickOutside: true,
                modalId: 'PickupOrderComponent'
              }
            );
          // 주문데이터가 2 이상일때
          } else {
            const msg = '';
            this.modal.openConfirm(
              {
                title: 'ECP 컨펌/출력',
                message: this.messageService.get('limitECPOrder'),
                actionButtonLabel: '확인',
                closeButtonLabel: '취소',
                closeByClickOutside: false,
                modalId: 'ORDERCONFIRM'
              }
            ).subscribe(
              result => {
                if (result) {
                  this.router.navigate(['/order-complete']);
                }
              }
            );
          }
        },
        error => {
          this.spinner.hide();
          const errdata = Utils.getError(error);
          if (errdata) {
            this.logger.set('order-menu.component', `Get Order Info error type : ${errdata.type}`).error();
            this.logger.set('order-menu.component', `Get Order Info error message : ${errdata.message}`).error();
            this.alert.error({ message: `${errdata.message}` });
          }
        },
        () => { this.spinner.hide(); }
      );
    } else {
      this.alert.error({ message: this.messageService.get('notSelectedUser') });
    }
  }

}
