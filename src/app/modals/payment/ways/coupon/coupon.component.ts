import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService, Modal, StorageService, SpinnerService, Logger } from '../../../../core';
import { VoucherPaymentInfo, PaymentModeData, CurrencyData } from './../../../../data/models/payment/payment-capture';
import { CouponPaymentComponent } from '../../coupon-payment/coupon-payment.component';
import { Accounts, KeyCode, Coupon, PaymentCapture, PaymentModes, Pagination } from '../../../../data';
import { ComplexPaymentComponent } from '../../complex-payment/complex-payment.component';
import { PaymentService, PagerService } from '../../../../service';
import { Cart } from '../../../../data/models/order/cart';
import { Order } from '../../../../data/models/order/order';
import { InfoBroker } from '../../../../broker';

@Component({
  selector: 'pos-coupon',
  templateUrl: './coupon.component.html'
})
export class CouponComponent extends ModalComponent implements OnInit, OnDestroy {
  accountInfo: Accounts;
  private cartInfo: Cart;
  private orderInfo: Order;
  private paymentcapture: PaymentCapture;
  private couponubscription: Subscription;
  private paymentsubscription: Subscription;
  private coupon: Coupon;
  couponlist: Coupon[];
  activeNum: number;
  couponCount: number;
  private page: Pagination;
  private pagesize = 5;
  constructor(protected modalService: ModalService, private modal: Modal, private spinner: SpinnerService,
    private info: InfoBroker, private payment: PaymentService, private storage: StorageService,
    private logger: Logger, private pager: PagerService) {
    super(modalService);
    this.couponCount = -1;
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.searchCoupon(0);
  }

  private searchCoupon(pagenum: number) {
    this.spinner.show();
    this.couponubscription = this.payment.searchCoupons(this.accountInfo.uid, this.accountInfo.parties[0].uid, pagenum, this.pagesize).subscribe(
      result => {
        this.couponlist = result.coupons;
        this.couponCount = this.couponlist.length;
        if (result.pagination) {
          this.page = result.pagination;
          this.paging(this.couponlist.length, pagenum, this.pagesize);
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
    if (this.coupon) {
      this.makePaymentCaptureData();
    } else {
      this.close();
      this.modal.openModalByComponent(CouponPaymentComponent,
        {
          callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo, coupon: this.coupon },
          closeByClickOutside: false,
          closeByEnter: false,
          modalId: 'CouponPaymentComponent_Pop'
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
        closeByEnter: false,
        closeByEscape: false,
        modalId: 'ComplexPaymentComponent_Cpp'
      }
    ).subscribe(result => {
      if (!result) {
        this.storage.removePaymentModeCode();
        this.storage.removePay();
      }
    });
  }

  setPage(pagenum: number) {
    if (pagenum < 1 || pagenum > this.page.totalPages) {
      return;
    }
    this.paging(this.couponlist.length, pagenum, this.pagesize);
    this.searchCoupon(pagenum);
  }

  private makePaymentCaptureData(): void {
    let pcap: PaymentCapture;
    this.paymentsubscription = this.payment.applyCoupon(this.accountInfo.parties[0].uid, this.cartInfo.code, this.coupon.couponCode).subscribe(
      result => {
        if (result) {
          this.logger.set('coupon.component', JSON.stringify(result, null, 2)).debug();
          const paidamount = result.totalDiscounts.value;
          const coupon = new VoucherPaymentInfo(paidamount);
          coupon.setName = (this.coupon) ? this.coupon.name : '';
          coupon.setPaymentModeData = new PaymentModeData(PaymentModes.COUPON);
          coupon.setCurrencyData = new CurrencyData();
          pcap = new PaymentCapture();
          pcap.setVoucherPaymentInfo = coupon;

          this.paymentcapture = pcap;

          // this.info.sendInfo('payinfo', [pcap, null]);
          this.sendPaymentAndOrder(pcap, null);

          this.openComplexPayment();
        } else {
          this.logger.set('coupon.component', `no apply or exist cart`).error();
        }
      },
      error => { this.logger.set('coupon.component', `${error}`).error(); });
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
    // this.info.sendInfo('coupon', payment);
    this.storage.setLocalItem('payinfo', [payment, order]);
  }

  close() {
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
  onAlertKeyDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ESCAPE) { // 27 : esc
      this.openComplexPayment();
    }
  }

}
