import { Component, OnInit, OnDestroy, ViewChild, HostListener, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { CompletePaymentComponent } from '../../complete-payment/complete-payment.component';
import { PaymentService, ReceiptService, MessageService, CartService } from '../../../../service';
import { ModalComponent, ModalService, StorageService, Modal, KeyboardService, KeyCommand, Logger, SpinnerService } from '../../../../core';
import {
  KeyCode, Balance, Accounts, PaymentCapture, StatusDisplay, AmwayExtendedOrdering, PointReCash, ModalIds
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
  private regex: RegExp = /[^0-9]+/g;
  private dupcheck = false;
  private orderInfo: Order;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private amwayExtendedOrdering: AmwayExtendedOrdering;
  private paymentcapture: PaymentCapture;
  private paymentsubscription: Subscription;
  private balancesubscription: Subscription;
  private alertsubscription: Subscription;
  private keyboardsubscription: Subscription;
  @ViewChild('usePoint') usePoint: ElementRef;
  @ViewChild('recashPanel') recashPanel: ElementRef;

  // spinnerService 는 HostListener 사용중
  constructor(protected modalService: ModalService, private modal: Modal,
    private receipt: ReceiptService, private payments: PaymentService, private keyboard: KeyboardService, private cartService: CartService,
    private storage: StorageService, private message: MessageService, private info: InfoBroker, private spinnerService: SpinnerService,
    private logger: Logger) {
    super(modalService);
    this.isAllPay = false;
    this.finishStatus = null;
    this.checktype = 0;
  }

  ngOnInit() {
    this.keyboardsubscription = this.keyboard.commands.subscribe(c => {
      this.handleKeyboardCommand(c);
    });
    setTimeout(() => { this.usePoint.nativeElement.focus(); }, 50);
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.amwayExtendedOrdering = this.callerData.amwayExtendedOrdering;
    if (this.callerData.paymentCapture) { this.paymentcapture = this.callerData.paymentCapture; }

    this.loadPayment();
    const pointrecash: PointReCash = this.storage.getPointReCash();
    if (pointrecash && pointrecash.recash) {
      this.recash = pointrecash.recash;
      this.useRecash();
    } else {
      this.balancesubscription = this.payments.getRecash(this.accountInfo.parties[0].uid).subscribe(
        result => {
          this.recash = result;
          this.useRecash();
        });
    }
  }

  ngOnDestroy() {
    if (this.balancesubscription) { this.balancesubscription.unsubscribe(); }
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    if (this.alertsubscription) { this.alertsubscription.unsubscribe(); }
    if (this.keyboardsubscription) { this.keyboardsubscription.unsubscribe(); }
    this.receipt.dispose();
  }

  private loadPayment() {
    this.paidamount = this.cartService.getTotalPriceWithTax(this.cartInfo); // this.cartInfo.totalPrice.value;
    const p: PaymentCapture = this.storage.getPaymentCapture() || this.paymentcapture;
    if (p && p.monetaryPaymentInfo) {
      if (this.paidamount === p.monetaryPaymentInfo.amount) {
        this.checkPay(0);
      } else {
        this.checkPay(1);
      }
      if (this.storage.getPay() > 0) {
        this.paidamount = this.storage.getPay();
      } else {
        this.paidamount = this.cartService.getPaymentPriceByPaid(p, this.cartInfo);
      }      
      this.usePoint.nativeElement.value = p.monetaryPaymentInfo.amount;
    } else {
      if (this.storage.getPay() > 0) {
        this.paidamount = this.storage.getPay();
      } else {
        this.paidamount = this.cartService.getPaymentPriceByPaid(p, this.cartInfo);
      }
    }
    this.useRecash();
  }

  useRecash() {
    if (this.recash) {
      const usecash = Number(this.usePoint.nativeElement.value.replace(this.regex, ''));
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
    if (type === 0) { // 전체금액
      this.usePoint.nativeElement.value = this.paidamount;
      this.change = this.recash.amount - this.paidamount;
      if (this.change < 0) {
        this.checktype = -3;
        this.apprmessage = this.message.get('recash.lack'); // '사용가능한 Re-Cash가 부족합니다.';
      } else {
        this.checktype = 0;
      }
      // 전체금액일 경우 팝업에 포커스를 주어야 ENTER키 이벤트 동작
      setTimeout(() => { this.recashPanel.nativeElement.focus(); }, 50);
      this.isAllPay = true;
    } else {
      this.isAllPay = false;
      this.usePoint.nativeElement.value = '';
      setTimeout(() => { this.usePoint.nativeElement.focus(); this.usePoint.nativeElement.select(); }, 50);
    }
  }

  /**
   * 일부금액일 경우 엔터키 입력시 바로 결제
   */
  pointEnter(evt: any) {
    if (!this.isAllPay) { // 일부금액
      const point: string = this.usePoint.nativeElement.value;
      if (Utils.isNotEmpty(point) || point !== '0') {
        this.doPay(evt);
      } else {
        setTimeout(() => { this.usePoint.nativeElement.blur(); }, 50);
      }
    }
  }

  payRecash(evt: KeyboardEvent) {
    evt.preventDefault();
    const usepoint = this.usePoint.nativeElement.value ? Number(this.usePoint.nativeElement.value.replace(this.regex, '')) : 0;
    const check = this.paidamount - usepoint;
    if (usepoint === 0) {
      this.checktype = -3;
      this.dupcheck = false;
      this.apprmessage = '사용할 금액을 입력해주세요.';
      return;      
    }
    if (this.change < 0) {
      this.checktype = -3;
      this.dupcheck = false;
      this.apprmessage = this.message.get('recash.lack');
      return;
    } else {
      this.checktype = 0;
    }

    setTimeout(() => { this.usePoint.nativeElement.blur(); }, 50);
    let paid: number = this.paidamount;
    if (!this.isAllPay) {
      paid = this.usePoint.nativeElement.value ? Number(this.usePoint.nativeElement.value.replace(this.regex, '')) : 0;
    }
    this.paymentcapture = this.payments.makeRecashPaymentCaptureData(this.paymentcapture, paid).capturePaymentInfoData;
    if (check > 0) { // 결제할것이 남음.
      this.storage.setPay(this.paidamount - usepoint); // 현재까지 결제할 남은 금액(전체결제금액 - 실결제금액)을 세션에 저장
      this.payments.sendPaymentAndOrderInfo(this.paymentcapture, null);
      this.finishStatus = StatusDisplay.PAID;
      this.apprmessage = this.message.get('payment.success.next');
      this.result = this.paymentcapture;
      this.close();
    } else if (check === 0) {
      this.result = this.paymentcapture;
      this.finishStatus = StatusDisplay.PAID;
      this.payments.sendPaymentAndOrderInfo(this.paymentcapture, null);
      this.apprmessage = this.message.get('payment.success');
      this.completePayPopup(this.paidamount, usepoint, check);
    }
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
      modalId: ModalIds.COMPLETE,
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

  @HostListener('document:keydown', ['$event', 'this.spinnerService.status()'])
  onAlertKeyDown(event: any, isSpinnerStatus: boolean) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER && !isSpinnerStatus) {
      const modalid = this.storage.getLatestModalId();
      if (modalid !== ModalIds.COMPLETE) { // 결제 최종 팝업이 떠있으면 처리하지 않음.
        this.doPay(event);
      }
    }
  }

  private doPay(event: any) {
    if (Utils.isPaymentSuccess(this.finishStatus)) {
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

  protected doPageUp(evt: any) {
    this.checkPay(1);
  }

  protected doPageDown(evt: any) {
    this.checkPay(0);
  }

  private handleKeyboardCommand(command: KeyCommand) {
    try {
      this[command.name](command.ev);
    } catch (e) {
      this.logger.set('keyboard.component', `[${command.combo}] key event, [${command.name}] undefined function!`).info();
    }
  }

}
