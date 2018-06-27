import { VoucherPaymentInfo, PaymentModeData, CurrencyData } from './../../../../data/models/payment/payment-capture';

import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';

import { ModalComponent, ModalService, Modal } from '../../../../core';
import { Subscription } from 'rxjs/Subscription';

import { CouponPaymentComponent } from '../../coupon-payment/coupon-payment.component';
import { Accounts, KeyCode, Coupon, PaymentCapture, PaymentModes, Pagination } from '../../../../data';
import { ComplexPaymentComponent } from '../../complex-payment/complex-payment.component';
import { PaymentService, PagerService } from '../../../../service';
import { Cart } from '../../../../data/models/order/cart';

@Component({
  selector: 'pos-coupon',
  templateUrl: './coupon.component.html'
})
export class CouponComponent extends ModalComponent implements OnInit, OnDestroy {
  accountInfo: Accounts;
  private cartInfo: Cart;
  private couponubscription: Subscription;
  private paymentsubscription: Subscription;
  private coupon: Coupon;
  couponlist: Coupon[];
  activeNum: number;
  couponCount: number;
  private page: Pagination;
  private pagesize = 5;
  constructor(protected modalService: ModalService, private modal: Modal, private payment: PaymentService, private pager: PagerService) {
    super(modalService);
    this.couponCount = -1;
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.searchCoupon(0);
  }

  private searchCoupon(pagenum: number) {
    this.couponubscription = this.payment.searchCoupon(this.accountInfo.uid, this.accountInfo.parties[0].uid, pagenum, this.pagesize).subscribe(result => {
      this.couponlist = result.coupons;
      this.couponCount = this.couponlist.length;
      this.page = result.pagination;
      this.paging(this.couponlist.length, pagenum, this.pagesize);
    });
  }

  ngOnDestroy() {
    if (this.couponubscription) { this.couponubscription.unsubscribe(); }
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
  }

  selectCoupon(evt: any) {
    this.modal.openModalByComponent(CouponPaymentComponent,
      {
        closeByClickOutside: false,
        modalId: 'CouponPayComponent'
      }
    );
  }

  /**
   * % 쿠폰은 자동 계산, 금액 쿠폰은 결제 팝업 뜸
   */
  paymentCoupon() {
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

  openComplexPayment() {
    this.close();
    this.modal.openModalByComponent(ComplexPaymentComponent,
      {
        callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo },
        closeByClickOutside: false,
        closeByEnter: false,
        closeByEscape: false,
        modalId: 'ComplexPaymentComponent_Pop'
      }
    );
  }

  setPage(pagenum: number) {
    if (pagenum < 1 || pagenum > this.page.totalPages) {
      return;
    }
    this.paging(this.couponlist.length, pagenum, this.pagesize);
    this.searchCoupon(pagenum);
  }

  private makePaymentCaptureData(paidamount: number): PaymentCapture {

    this.paymentsubscription = this.payment.applyCoupon(this.accountInfo.parties[0].uid, this.cartInfo.code, this.coupon.couponCode).subscribe(
      data => {

      });


    const coupon = new VoucherPaymentInfo(paidamount);
    coupon.setName = (this.coupon) ? this.coupon.name : '';
    coupon.setPaymentModeData = new PaymentModeData(PaymentModes.COUPON);
    coupon.setCurrencyData = new CurrencyData();
    const paymentcapture = new PaymentCapture();
    paymentcapture.setVoucherPaymentInfo = coupon;
    return paymentcapture;
  }

  activeRow(index: number, coupon: Coupon) {
    this.activeNum = index;
    this.coupon = coupon;
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
