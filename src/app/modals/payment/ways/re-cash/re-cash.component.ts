import { Component, OnInit, OnDestroy, ViewChild, HostListener, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { CompletePaymentComponent } from '../../complete-payment/complete-payment.component';
import { PaymentService, ReceiptService, MessageService } from '../../../../service';
import { ModalComponent, ModalService, StorageService, Modal } from '../../../../core';
import {
  KeyCode, Balance, Accounts, PaymentCapture, AmwayMonetaryPaymentInfo,
  PaymentModes, PaymentModeData, StatusDisplay, CurrencyData, CapturePaymentInfo, AmwayExtendedOrdering
} from '../../../../data';
import { Order } from '../../../../data/models/order/order';
import { Cart } from '../../../../data/models/order/cart';
import { InfoBroker } from '../../../../broker';
import { Utils } from '../../../../core/utils';

@Component({
  selector: 'pos-re-cash',
  templateUrl: './re-cash.component.html'
})
export class ReCashComponent extends ModalComponent implements OnInit, OnDestroy {
  finishStatus: string;
  isAllPay: boolean;
  paidamount: number;
  change: number;
  recash: Balance;
  checktype: number;
  apprmessage: string;
  private dupcheck = false;
  private orderInfo: Order;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private amwayExtendedOrdering: AmwayExtendedOrdering;
  private paymentcapture: PaymentCapture;
  private paymentType: string;
  private paymentsubscription: Subscription;
  private balancesubscription: Subscription;
  private alertsubscription: Subscription;
  @ViewChild('usePoint') usePoint: ElementRef;
  @ViewChild('recashPanel') recashPanel: ElementRef;
  constructor(protected modalService: ModalService, private modal: Modal, private receipt: ReceiptService, private payments: PaymentService,
    private storage: StorageService, private message: MessageService, private info: InfoBroker) {
    super(modalService);
    this.isAllPay = false;
    this.finishStatus = null;
    this.checktype = 0;
  }

  ngOnInit() {
    setTimeout(() => { this.usePoint.nativeElement.focus(); }, 50);
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.amwayExtendedOrdering = this.callerData.amwayExtendedOrdering;
    if (this.callerData.paymentCapture) { this.paymentcapture = this.callerData.paymentCapture; }

    if (this.storage.getPay() === 0) {
      this.paidamount = this.cartInfo.totalPrice.value;
    } else {
      this.paidamount = this.storage.getPay();
    }

    this.balancesubscription = this.payments.getRecash(this.accountInfo.parties[0].uid).subscribe(result => {
      this.recash = result;
    });
  }

  ngOnDestroy() {
    if (this.balancesubscription) { this.balancesubscription.unsubscribe(); }
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    if (this.alertsubscription) { this.alertsubscription.unsubscribe(); }
    this.receipt.dispose();
  }

  useRecash() {
    if (this.recash) {
      const usecash = this.usePoint.nativeElement.value;
      this.change = this.recash.amount - usecash;
      if (this.change < 0) {
        this.checktype = -3;
        this.apprmessage = this.message.get('recash.lack'); // '사용가능한 Re-Cash가 부족합니다.';
      } else {
        this.checktype = 0;
      }
    }
  }

  checkPay(type: number) {
    if (type === 0) {
      this.usePoint.nativeElement.value = this.paidamount;
      this.change = this.recash.amount - this.paidamount;
      if (this.change < 0) {
        this.checktype = -3;
        this.apprmessage = this.message.get('recash.lack'); // '사용가능한 Re-Cash가 부족합니다.';
      } else {
        this.checktype = 0;
      }
      setTimeout(() => {
        this.recashPanel.nativeElement.focus(); // 전체금액일 경우 팝업에 포커스를 주어야 ENTER키 이벤트 동작
      }, 50);
      this.isAllPay = true;
    } else {
      this.isAllPay = false;
      setTimeout(() => { this.usePoint.nativeElement.focus(); }, 50);
    }
  }

  pointBlur() {
    const point = this.usePoint.nativeElement.value;
    if (Utils.isNotEmpty(point)) {
      setTimeout(() => { this.usePoint.nativeElement.blur(); }, 50);
    }
  }

  payRecash(evt: KeyboardEvent) {
    evt.preventDefault();
    const usepoint = this.usePoint.nativeElement.value ? Number(this.usePoint.nativeElement.value) : 0;
    const check = this.paidamount - usepoint;
    if (this.change < 0) {
      this.checktype = -3;
      this.dupcheck = false;
      this.apprmessage = this.message.get('recash.lack'); // '사용가능한 Re-Cash가 부족합니다.';
      return;
    } else {
      this.checktype = 0;
    }

    setTimeout(() => { this.usePoint.nativeElement.blur(); }, 50);
    let paid: number = this.paidamount;
    if (!this.isAllPay) {
      paid = this.usePoint.nativeElement.value ? Number(this.usePoint.nativeElement.value) : 0;
    }
    this.paymentcapture = this.makePaymentCaptureData(paid).capturePaymentInfoData;
    this.result = this.paymentcapture;
    if (check > 0) { // 결제할것이 남음.
      this.storage.setPay(this.paidamount - usepoint); // 현재까지 결제할 남은 금액(전체결제금액 - 실결제금액)을 세션에 저장
      this.sendPaymentAndOrder(this.paymentcapture, null);
      this.finishStatus = StatusDisplay.PAID;
      this.apprmessage = this.message.get('payment.success.next');
    } else if (check === 0) {
      this.finishStatus = StatusDisplay.PAID;
      this.apprmessage = this.message.get('payment.success');
      this.completePayPopup(this.paidamount, usepoint, check);
    }

  }

  private makePaymentCaptureData(paidamount: number): CapturePaymentInfo {
    const capturepaymentinfo = new CapturePaymentInfo();
    const recash = new AmwayMonetaryPaymentInfo(paidamount);
    recash.setPaymentModeData = new PaymentModeData(PaymentModes.ARCREDIT);
    recash.setCurrencyData = new CurrencyData();
    if (this.paymentcapture) {

      this.paymentcapture.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
      this.paymentcapture.setMonetaryPaymentInfo = recash;
      capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode();
      capturepaymentinfo.capturePaymentInfoData = this.paymentcapture;

    } else {
      const paymentcapture = new PaymentCapture();
      paymentcapture.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
      paymentcapture.setMonetaryPaymentInfo = recash;
      capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode() ? this.storage.getPaymentModeCode() : PaymentModes.ARCREDIT;
      capturepaymentinfo.capturePaymentInfoData = paymentcapture;
    }
    return capturepaymentinfo;
  }

  /**
   * 장바구니와 클라이언트에 정보 전달
   *
   * @param payment Payment Capture 정보
   * @param order Order 정보
   */
  private sendPaymentAndOrder(payment: PaymentCapture, order: Order) {
    this.info.sendInfo('payinfo', [payment, order]);
    this.storage.setLocalItem('payinfo', [payment, order]);
  }

  /**
   * 최종 결제 팝업 띄우기
   *
   * @param paidAmount 결제금액
   * @param payAmount 지불금액
   * @param change 거스름돈
   */
  private completePayPopup(paidAmount: number, payAmount: number, change: number) {
    this.close();
    this.modal.openModalByComponent(CompletePaymentComponent, {
      callerData: {
        account: this.accountInfo, cartInfo: this.cartInfo, paymentInfo: this.paymentcapture,
        paidAmount: paidAmount, payAmount: payAmount, change: change, amwayExtendedOrdering: this.amwayExtendedOrdering
      },
      closeByClickOutside: false,
      closeByEscape: false,
      modalId: 'CompletePaymentComponent',
      paymentType: 'c'
    });
  }

  /**
   * 결제 종료 후 엔터키 처리
   */
  private payFinishByEnter() {
    this.close();
  }

  close() {
    this.closeModal();
  }

  @HostListener('document:keydown', ['$event'])
  onAlertKeyDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      const modalid = this.storage.getLatestModalId();
      if (modalid !== 'CompletePaymentComponent') { // 결제 최종 팝업이 떠있으면 처리하지 않음.
        if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
          this.payFinishByEnter();
        } else if (this.finishStatus === 'recart') {
          this.info.sendInfo('recart', this.orderInfo);
          this.info.sendInfo('orderClear', 'clear');
          this.close();
        } else {
          if (!this.dupcheck) {
            setTimeout(() => { this.payRecash(event); }, 200);
            this.dupcheck = true;
          }
        }
      }
    }
  }

}
