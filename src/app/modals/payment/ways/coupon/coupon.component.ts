import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ComplexPaymentComponent } from '../../complex-payment/complex-payment.component';
import { ModalComponent, ModalService, Modal, StorageService, Logger, AlertService, SpinnerService } from '../../../../core';
import { PaymentService, MessageService } from '../../../../service';
import { InfoBroker } from '../../../../broker';
import {
  Accounts, KeyCode, Coupon, PaymentCapture, PaymentModes, Pagination,
  CurrencyData, VoucherPaymentInfo, PaymentModeData, StatusDisplay, AmwayExtendedOrdering, ModalIds, CouponList
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
  coupons: Coupon[];
  activeNum: number;
  couponCount: number;
  checktype: number;
  finishStatus: string;
  apprmessage: string;
  private couponlist: CouponList;
  private addPopupType: string;
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

  // spinnerService 는 HostListener 사용중
  constructor(protected modalService: ModalService, private modal: Modal,
    private info: InfoBroker, private payment: PaymentService, private storage: StorageService,
    private message: MessageService, private alert: AlertService, private spinnerService: SpinnerService, private logger: Logger) {
    super(modalService);
    this.couponCount = -1;
    this.checktype = 0;
    this.finishStatus = null;
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.amwayExtendedOrdering = this.callerData.amwayExtendedOrdering;
    this.addPopupType = this.callerData.addPopupType;
    this.couponlist = this.callerData.couponlist;
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

  /**
   * 쿠폰 목록 검색
   *
   * 메뉴 페이지에서 쿠폰 검색 목록 초기 데이터(첫번째 페이지 couponlist) 가 넘어올 경우는
   * 이 초기 데이터를 이용하여 페이지 출력
   * 주의) 출력 후에는 초기 데이터를 지워주어야 페이징 검색이 동작함
   * 메뉴 페이지에서 쿠폰 초기 데이터가 없는 경우는 쿠폰 페이지로 오지 않음.
   *
   * @param pagenum 페이지 번호
   */
  private searchCoupons(pagenum: number) {
    if (pagenum === 0 && this.couponlist) {
      const cl = this.couponlist;
      this.coupons = cl.coupons;
      this.couponCount = cl.pagination.totalResults;
      if (cl.pagination) {
        this.page = cl.pagination;
        this.paging(this.couponCount, pagenum, this.pagesize);
      }
      this.couponlist = null;
    } else {
      this.couponssubscription = this.payment.searchCoupons(this.accountInfo.uid, this.accountInfo.parties[0].uid, pagenum, this.pagesize).subscribe(
        result => {
          this.coupons = result.coupons;
          this.couponCount = result.pagination.totalResults;
          if (result.pagination) {
            this.page = result.pagination;
            this.paging(this.couponCount, pagenum, this.pagesize);
          }
        },
        error => { this.logger.set('coupon.component', `${error}`).error(); });
    }
  }

  /**
   * 바코드 쿠폰 검색 시 단건 검색
   *
   * @param couponcode 쿠폰코드
   */
  searchCoupon(couponcode: string) {
    if (Utils.isEmpty(couponcode)) {
      this.checktype = -2;
      this.apprmessage = this.message.get('empty.coupon'); // '검색할 쿠폰번호를 입력해주세요.';
      return;
    }
    this.couponsubscription = this.payment.searchCoupon(this.accountInfo.uid, this.accountInfo.parties[0].uid, couponcode).subscribe(
      result => {
        if (result) {
          this.coupon = result ? result.coupons[0] : null;
          if (this.finishStatus !== StatusDisplay.PAID) {
            this.applyCouponAndPaymentCapture();
          }
        } else {
          this.checktype = -1;
          this.apprmessage = this.message.get('noresult.coupon'); // '해당 쿠폰이 존재하지 않습니다. 쿠폰번호를 다시 확인해주세요.';
          this.alert.warn({ message: this.message.get('noresult.coupon'), timer: true, interval: 1500 });
        }
      },
      error => {
        this.checktype = -1;
        this.apprmessage = this.message.get('nosearch.coupon'); // '해당 쿠폰이 존재하지 않습니다. 쿠폰번호를 다시 확인해주세요.';
        this.logger.set('coupon.component', `${error}`).error();
        this.alert.warn({ message: this.message.get('nosearch.coupon'), timer: true, interval: 1500 });
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

  openComplexPayment(cartInfo?: Cart) {
    setTimeout(() => { this.close(); }, 100);
    if (!cartInfo) { cartInfo = this.cartInfo; }
    this.modal.openModalByComponent(ComplexPaymentComponent, {
      callerData: {
        accountInfo: this.accountInfo, cartInfo: cartInfo,
        paymentCapture: this.paymentcapture, amwayExtendedOrdering: this.amwayExtendedOrdering,
        addPopupType: this.addPopupType
      },
      closeByClickOutside: false,
      closeByEscape: false,
      modalId: ModalIds.COMPLEX
    }).subscribe(result => {
      this.info.sendInfo('payreset', true); // this.posPayReset.emit({ reset: true });
      if (!result) {
        this.storage.removePaymentModeCode();
        this.storage.removePaymentCapture();
        this.storage.removePay();
      }
    });
  }

  setPage(pagenum: number) {
    if (pagenum < 0 || pagenum > this.page.totalPages - 1) { return; }
    this.activeNum = -1;
    this.coupon = null;
    this.paging(this.couponCount, pagenum, this.pagesize);
    this.searchCoupons(pagenum);
  }

  private applyCouponAndPaymentCapture(): void {
    let pcap: PaymentCapture;
    this.paymentsubscription = this.payment.applyCoupon(this.accountInfo.parties[0].uid, this.cartInfo.code, this.coupon.couponCode).subscribe(
      result => {
        if (result) {
          this.finishStatus = StatusDisplay.PAID;
          this.cartInfo = result; // apply 된 CART 정보 세팅
          const paidamount = result.totalDiscounts.value;
          const coupon = new VoucherPaymentInfo(paidamount);
          coupon.setName = (this.coupon) ? this.coupon.name : '';
          coupon.setPaymentModeData = new PaymentModeData(PaymentModes.COUPON);
          coupon.setCurrencyData = new CurrencyData();
          pcap = new PaymentCapture();
          pcap.setVoucherPaymentInfo = coupon;
          this.paymentcapture = pcap;
          this.sendPaymentAndOrder(pcap, null);
          this.openComplexPayment(result);
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

  @HostListener('document:keydown', ['$event', 'this.spinnerService.status()'])
  onCouponKeyDown(event: any, isSpinnerStatus: boolean) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ESCAPE && !isSpinnerStatus) { // 27 : esc
      this.openComplexPayment();
    }
  }

}
