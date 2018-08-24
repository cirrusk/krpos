import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ComplexPaymentComponent } from '../../complex-payment/complex-payment.component';
import { ModalComponent, ModalService, Modal, StorageService, Logger, AlertService } from '../../../../core';
import { PaymentService, MessageService } from '../../../../service';
import { InfoBroker } from '../../../../broker';
import {
  Accounts, KeyCode, Coupon, PaymentCapture, PaymentModes, Pagination,
  CurrencyData, VoucherPaymentInfo, PaymentModeData, StatusDisplay, AmwayExtendedOrdering
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
  apprmessage: string;
  private orderInfo: Order;
  private cartInfo: Cart;
  private amwayExtendedOrdering: AmwayExtendedOrdering;
  private paymentcapture: PaymentCapture;
  private alertsubscription: Subscription;
  private couponssubscription: Subscription;
  private couponsubscription: Subscription;
  private paymentsubscription: Subscription;
  private coupon: Coupon;
  private page: Pagination;
  private pagesize = 5;
  constructor(protected modalService: ModalService, private modal: Modal,
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
    this.amwayExtendedOrdering = this.callerData.amwayExtendedOrdering;
    this.searchCoupons(0);
    // 이미 장바구니에 적용된 경우 CART를 새로 구성해야 쿠폰 재설정 가능
    this.alertsubscription = this.alert.alertState.subscribe(state => {
      if (!state.show) {
        this.info.sendInfo('recart', this.orderInfo);
        setTimeout(() => { this.close(); }, 50);
      }
    });
  }

  ngOnDestroy() {
    if (this.couponssubscription) { this.couponssubscription.unsubscribe(); }
    if (this.couponsubscription) { this.couponsubscription.unsubscribe(); }
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    if (this.alertsubscription) { this.alertsubscription.unsubscribe(); }
  }

  check(couponcode: string) {
    if (Utils.isEmpty(couponcode)) {
      this.checktype = -2;
      this.apprmessage = this.message.get('empty.coupon'); // '검색할 쿠폰번호를 입력해주세요.';
    }
  }

  private searchCoupons(pagenum: number) {
    this.couponssubscription = this.payment.searchCoupons(this.accountInfo.uid, this.accountInfo.parties[0].uid, pagenum, this.pagesize).subscribe(
      result => {
        this.couponlist = result.coupons;
        this.couponCount = result.pagination.totalResults;
        if (result.pagination) {
          this.page = result.pagination;
          this.paging(this.couponCount, pagenum, this.pagesize);
        }
      },
      error => { this.logger.set('coupon.component', `${error}`).error(); });
  }

  searchCoupon(couponcode: string) {
    if (Utils.isEmpty(couponcode)) {
      this.checktype = -2;
      this.apprmessage = this.message.get('empty.coupon'); // '검색할 쿠폰번호를 입력해주세요.';
      return;
    }
    this.couponsubscription = this.payment.searchCoupon(this.accountInfo.uid, this.accountInfo.parties[0].uid, couponcode).subscribe(
      result => {
        if (result) {
          this.coupon = result;
          if (this.finishStatus !== StatusDisplay.PAID) {
            this.applyCouponAndPaymentCapture();
          }
        } else {
          this.checktype = -1;
          this.apprmessage = this.message.get('noresult.coupon'); // '해당 쿠폰이 존재하지 않습니다. 쿠폰번호를 다시 확인해주세요.';
        }
      },
      error => {
        this.checktype = -1;
        this.apprmessage = this.message.get('noresult.coupon'); // '해당 쿠폰이 존재하지 않습니다. 쿠폰번호를 다시 확인해주세요.';
        this.logger.set('coupon.component', `${error}`).error();
      });
  }

  /**
   * % 쿠폰은 자동 계산, 금액 쿠폰은 결제 팝업 뜸
   * -> 변경 쿠폰 정보 조회창에서 쿠폰 바코드 스캔이나 입력까지 처리
   */
  paymentCoupon() {
    if (this.coupon && this.finishStatus === null) {
      this.applyCouponAndPaymentCapture();
    }
  }

  openComplexPayment() {
    this.close();
    this.modal.openModalByComponent(ComplexPaymentComponent, {
      callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo, paymentCapture: this.paymentcapture, amwayExtendedOrdering: this.amwayExtendedOrdering },
      closeByClickOutside: false,
      closeByEscape: false,
      modalId: 'ComplexPaymentComponent_Cpn'
    }).subscribe(result => {
      if (!result) {
        this.storage.removePaymentModeCode();
        this.storage.removePay();
        this.storage.removePaymentCapture();
      }
    });
  }

  setPage(pagenum: number) {
    if (pagenum < 0 || pagenum > this.page.totalPages - 1) { return; }
    this.activeNum = -1;
    this.coupon = null;
    this.paging(this.couponlist.length, pagenum, this.pagesize);
    this.searchCoupons(pagenum);
  }

  private applyCouponAndPaymentCapture(): void {
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
          this.finishStatus = 'notexist';
          this.logger.set('coupon.component', `no apply or exist cart`).error();
        }
      },
      error => {
        // this.finishStatus = 'fail';
        const errdata = Utils.getError(error);
        if (errdata) {
          this.activeNum = -1;
          this.coupon = null;
          this.alert.show({ message: this.message.get(errdata.message) });
        }
      });
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
