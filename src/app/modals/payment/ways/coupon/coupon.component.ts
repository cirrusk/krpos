import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { CouponPaymentComponent } from '../../coupon-payment/coupon-payment.component';
import { ComplexPaymentComponent } from '../../complex-payment/complex-payment.component';
import { ModalComponent, ModalService, Modal, StorageService, SpinnerService, Logger, AlertService } from '../../../../core';
import { PaymentService, MessageService } from '../../../../service';
import { InfoBroker } from '../../../../broker';
import {
  Accounts, KeyCode, Coupon, PaymentCapture, PaymentModes, Pagination,
  CurrencyData, VoucherPaymentInfo, PaymentModeData, StatusDisplay
} from '../../../../data';
import { Cart } from '../../../../data/models/order/cart';
import { Order } from '../../../../data/models/order/order';
import { Utils } from '../../../../core/utils';

@Component({
  selector: 'pos-coupon',
  templateUrl: './coupon.component.html'
})
export class CouponComponent extends ModalComponent implements OnInit, OnDestroy {
  accountInfo: Accounts;
  couponlist: Coupon[];
  activeNum: number;
  couponCount: number;
  checktype: number;
  finishStatus: string;
  private orderInfo: Order;
  private cartInfo: Cart;
  private paymentcapture: PaymentCapture;
  private couponubscription: Subscription;
  private paymentsubscription: Subscription;
  private coupon: Coupon;
  private page: Pagination;
  private pagesize = 5;
  constructor(protected modalService: ModalService, private modal: Modal, private spinner: SpinnerService,
    private info: InfoBroker, private payment: PaymentService, private storage: StorageService,
    private message: MessageService, private alert: AlertService, private logger: Logger) {
    super(modalService);
    this.couponCount = -1;
    this.checktype = 0;
    this.finishStatus = null;
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.searchCoupon(0);
    // 이미 장바구니에 적용된 경우 CART를 새로 구성해야 쿠폰 재설정 가능
    this.alert.alertState.subscribe(state => {
      if (!state.show) {
        this.info.sendInfo('recart', this.orderInfo);
        setTimeout(() => { this.close(); }, 50);
      }
    });
  }

  private searchCoupon(pagenum: number) {
    this.spinner.show();
    this.couponubscription = this.payment.searchCoupons(this.accountInfo.uid, this.accountInfo.parties[0].uid, pagenum, this.pagesize).subscribe(
      result => {
        this.couponlist = result.coupons;
        this.couponCount = result.pagination.totalResults;
        if (result.pagination) {
          this.page = result.pagination;
          this.paging(this.couponCount, pagenum, this.pagesize);
        }
      },
      error => { this.logger.set('coupon.component', `${error}`).error(); },
      () => { this.spinner.hide(); });
  }

  ngOnDestroy() {
    if (this.couponubscription) { this.couponubscription.unsubscribe(); }
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
  }

  /**
   * % 쿠폰은 자동 계산, 금액 쿠폰은 결제 팝업 뜸
   */
  paymentCoupon() {
    if (this.coupon && this.finishStatus === null) {
      this.applyCouponAndPaymentCapture();
    } else {
      this.close();
      this.modal.openModalByComponent(CouponPaymentComponent,
        {
          callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo, coupon: this.coupon },
          closeByClickOutside: false,
          closeByEnter: false,
          modalId: 'CouponPaymentComponent_Cpn'
        }
      );
    }
  }

  openComplexPayment() {
    this.close();
    this.modal.openModalByComponent(ComplexPaymentComponent,
      {
        callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo, paymentCapture: this.paymentcapture },
        closeByClickOutside: false,
        modalId: 'ComplexPaymentComponent_Cpn'
      }
    ).subscribe(result => {
      if (!result) {
        this.storage.removePaymentModeCode();
        this.storage.removePay();
      }
    });
  }

  setPage(pagenum: number) {
    if (pagenum < 0 || pagenum > this.page.totalPages - 1) { return; }
    this.activeNum = -1;
    this.coupon = null;
    this.paging(this.couponlist.length, pagenum, this.pagesize);
    this.searchCoupon(pagenum);
  }

  private applyCouponAndPaymentCapture(): void {
    this.spinner.show();
    let pcap: PaymentCapture;
    this.paymentsubscription = this.payment.applyCoupon(this.accountInfo.parties[0].uid, this.cartInfo.code, this.coupon.couponCode).subscribe(
      result => {
        if (result) {
          this.finishStatus = StatusDisplay.PAID;
          const paidamount = result.totalDiscounts.value;
          const coupon = new VoucherPaymentInfo(paidamount);
          coupon.setName = (this.coupon) ? this.coupon.name : '';
          coupon.setPaymentModeData = new PaymentModeData(PaymentModes.COUPON);
          coupon.setCurrencyData = new CurrencyData();
          pcap = new PaymentCapture();
          pcap.setVoucherPaymentInfo = coupon;
          this.paymentcapture = pcap;
          this.sendPaymentAndOrder(pcap, null);
          this.openComplexPayment();
        } else {
          this.spinner.hide();
          this.finishStatus = 'notexist';
          this.logger.set('coupon.component', `no apply or exist cart`).error();
        }
      },
      error => {
        this.spinner.hide();
        // this.finishStatus = 'fail';
        const errdata = Utils.getError(error);
        if (errdata) {
          this.activeNum = -1;
          this.coupon = null;
          this.alert.show({ message: this.message.get(errdata.message) });
        }
      },
      () => { this.spinner.hide(); });
  }

  activeRow(index: number, coupon: Coupon) {
    if (this.activeNum === index) {
      this.activeNum = -1;
      this.coupon = null;
      return;
    }
    if (coupon.status === 'effective') {
      this.activeNum = index;
      this.coupon = coupon;
    } else {
      this.activeNum = -1;
      this.coupon = null;
    }
  }

  /**
   * 장바구니와 클라이언트에 정보 전달, 복합결제 창에 전달
   *
   * @param payment Payment Capture 정보
   * @param order Order 정보
   */
  private sendPaymentAndOrder(payment: PaymentCapture, order: Order) {
    this.info.sendInfo('payinfo', [payment, order]);
    this.storage.setLocalItem('payinfo', [payment, order]);
  }

  close() {
    console.log('111111111111111111111');
    this.closeModal();
  }

  private paging(totalItems: number, currentPage: number = 1, pageSize: number = 5): void {
    // 총 페이지 수
    const totalPages = Math.ceil(totalItems / pageSize);
    // 페이지 설정
    this.page.startPage = 0;
    this.page.pageSize = pageSize;
    this.page.endPage = totalPages - 1;
    this.page.totalPages = totalPages;
    // 출력 index
    this.page.startIndex = (currentPage - 1) * pageSize;
    this.page.endIndex = Math.min(this.page.startIndex + pageSize - 1, totalItems - 1);
    // Item 설정
    this.page.totalItems = totalItems;
    this.page.currentPage = currentPage;
  }

  @HostListener('document:keydown', ['$event'])
  onCouponKeyDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ESCAPE) { // 27 : esc
      this.openComplexPayment();
    }
  }

}
