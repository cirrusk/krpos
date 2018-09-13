import { Component, OnInit, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { CompletePaymentComponent } from '../../complete-payment/complete-payment.component';
import { PaymentService, MessageService, ReceiptService, CartService } from '../../../../service';
import { ModalComponent, ModalService, Logger, StorageService, Modal, KeyboardService, KeyCommand } from '../../../../core';
import {
  KeyCode, Accounts, Balance, PaymentCapture, StatusDisplay, AmwayExtendedOrdering, PointReCash, ModalIds
} from '../../../../data';
import { Cart } from './../../../../data/models/order/cart';
import { Order } from '../../../../data/models/order/order';
import { InfoBroker } from '../../../../broker';
import { Utils } from '../../../../core/utils';

@Component({
  selector: 'pos-point',
  templateUrl: './point.component.html'
})
export class PointComponent extends ModalComponent implements OnInit, OnDestroy {
  finishStatus: string;
  pointType: string; // modal component 호출 시 전달 받은 포인트 타입
  pointTypeText: string;
  isAllPay: boolean;
  point: number;
  paymentprice: number;
  change: number;
  checktype: number;
  apprmessage: string;
  private regex: RegExp = /[^0-9]+/g;
  private orderInfo: Order;
  private paymentcapture: PaymentCapture;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private amwayExtendedOrdering: AmwayExtendedOrdering;
  private paymentType: string;
  private balance: Balance;
  private dupcheck = false;
  private balancesubscription: Subscription;
  private paymentsubscription: Subscription;
  private alertsubscription: Subscription;
  private keyboardsubscription: Subscription;
  @ViewChild('usePoint') usePoint: ElementRef;
  @ViewChild('pointPanel') pointPanel: ElementRef;
  @ViewChild('allCheck') allCheck: ElementRef;
  @ViewChild('partCheck') partCheck: ElementRef;
  constructor(protected modalService: ModalService,
    private modal: Modal,
    private payments: PaymentService,
    private receipt: ReceiptService,
    private message: MessageService,
    private storage: StorageService,
    private keyboard: KeyboardService,
    private cartService: CartService,
    private info: InfoBroker,
    private logger: Logger) {
    super(modalService);
    this.isAllPay = true;
    this.finishStatus = null;
    this.checktype = 0;
  }

  ngOnInit() {
    this.keyboardsubscription = this.keyboard.commands.subscribe(c => {
      this.handleKeyboardCommand(c);
    });
    if (this.pointType === 'a') {
      this.pointTypeText = this.message.get('abo.point.label'); // 'A포인트';
    } else {
      this.pointTypeText = this.message.get('member.point.label'); // 'Member 포인트';
    }
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.amwayExtendedOrdering = this.callerData.amwayExtendedOrdering;
    if (this.callerData.paymentCapture) { this.paymentcapture = this.callerData.paymentCapture; }
    this.loadPayment();
    this.getBalance();
  }

  ngOnDestroy() {
    if (this.balancesubscription) { this.balancesubscription.unsubscribe(); }
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    if (this.alertsubscription) { this.alertsubscription.unsubscribe(); }
    if (this.keyboardsubscription) { this.keyboardsubscription.unsubscribe(); }
    this.receipt.dispose();
  }

  private loadPayment() {
    this.paymentprice = this.cartService.getTotalPriceWithTax(this.cartInfo); // this.cartInfo.totalPrice.value;
    const p: PaymentCapture = this.paymentcapture || this.storage.getPaymentCapture();
    if (p && p.pointPaymentInfo) {
      if (this.paymentprice === p.pointPaymentInfo.amount) { //  전체금액
        this.checkPay(0);
      } else {
        this.checkPay(1);
      }
      this.usePoint.nativeElement.value = p.pointPaymentInfo.amount;
    } else {
      if (this.storage.getPay() > 0) {
        this.paymentprice = this.storage.getPay();
      }
      this.usePoint.nativeElement.value = this.paymentprice;
    }
  }

  private getBalance() {
    const pointrecash: PointReCash = this.storage.getPointReCash();
    if (pointrecash && pointrecash.point) {
      this.balance = pointrecash.point;
      this.point = this.balance.amount;
      const changeprice = this.point - this.paymentprice;
      this.change = (changeprice < 0) ? 0 : changeprice;
    } else {
      this.balancesubscription = this.payments.getBalance(this.accountInfo.parties[0].uid).subscribe(
        result => {
          this.balance = result;
          this.point = this.balance.amount;
          const changeprice = this.point - this.paymentprice;
          this.change = (changeprice < 0) ? 0 : changeprice;
        },
        error => { this.logger.set('point.component', `${error}`).error(); });
    }
  }

  setChange(usepoint) {
    if (usepoint > 0) {
      this.change = this.point - usepoint;
      this.validationComplex();
    }
  }

  checkPay(type: number) {
    if (type === 0) { // 전체금액
      this.usePoint.nativeElement.value = this.paymentprice;
      this.change = 0;
      setTimeout(() => {
        this.pointPanel.nativeElement.focus(); // 전체금액일 경우 팝업에 포커스를 주어야 ENTER키 이벤트 동작
        this.isAllPay = true;
        this.setChange(this.paymentprice);
      }, 50);
    } else {
      this.usePoint.nativeElement.value = '';
      this.isAllPay = false;
      this.usePoint.nativeElement.focus();
      this.usePoint.nativeElement.select();
      this.change = this.point;
      this.validationComplex();
    }
  }

  /**
   * 일부금액일 경우 엔터키 입력시 바로 결제
   */
  pointEnter() {
    if (!this.isAllPay) { // 일부금액
      const point = this.usePoint.nativeElement.value;
      if (Utils.isNotEmpty(point)) {
        this.doPay();
      } else {
        setTimeout(() => { this.usePoint.nativeElement.blur(); }, 50);
      }
    }
  }

  private validationComplex() {
    let usepoint = 0;
    if (this.isAllPay) {
      usepoint = this.paymentprice;
    } else {
      usepoint = this.usePoint.nativeElement.value ? Number(this.usePoint.nativeElement.value.replace(this.regex, '')) : 0;
    }
    if (this.change < 0) {
      this.checktype = -4;
      this.apprmessage = this.message.get('point.use.over'); // 가용포인트 보다 사용포인트가 큽니다.
      this.dupcheck = false;
      return;
    }
    const paid = this.paymentprice - usepoint;
    if (paid < 0) { // 포인트가 많음.
      this.checktype = -2;
      this.apprmessage = this.message.get('point.overpaid'); // '사용 포인트가 결제금액보다 많습니다.';
      this.dupcheck = false;
    } else {
      this.checktype = 0;
    }
  }

  payPoint() {
    if (this.finishStatus !== null) {
      this.close();
      return;
    }
    let usepoint = 0;
    if (this.isAllPay) {
      usepoint = this.paymentprice;
    } else {
      usepoint = this.usePoint.nativeElement.value ? Number(this.usePoint.nativeElement.value.replace(this.regex, '')) : 0;
      if (usepoint === 0) {
        this.checktype = -3;
        this.apprmessage = this.message.get('point.empty'); // '사용 포인트가 공란입니다.';
        this.dupcheck = false;
        return;
      }
    }
    if (this.point < usepoint) {
      this.checktype = -4;
      this.apprmessage = this.message.get('point.use.over'); // 가용포인트 보다 사용포인트가 큽니다.
      this.dupcheck = false;
      return;
    }
    const paid = this.paymentprice - usepoint;
    this.checktype = 0;
    this.paymentcapture = this.payments.makePointPaymentCaptureData(this.paymentcapture, this.pointType, usepoint).capturePaymentInfoData;
    if (paid > 0) { // 결제할것이 남음.
      this.result = this.paymentcapture;
      this.finishStatus = StatusDisplay.PAID;
      this.apprmessage = this.message.get('payment.success.next');
      this.storage.setPay(this.paymentprice - usepoint); // 현재까지 결제할 남은 금액(전체결제금액 - 실결제금액)을 세션에 저장
      this.payments.sendPaymentAndOrderInfo(this.paymentcapture, null);
      this.close();
    } else if (paid === 0) {
      this.payments.sendPaymentAndOrderInfo(this.paymentcapture, null);
      this.result = this.paymentcapture;
      this.completePayPopup(usepoint, this.paymentprice, 0);
    } else {
      // this.finishStatus = 'fail';
      this.checktype = -4;
      this.apprmessage = this.message.get('point.overpaid'); // '사용 포인트가 결제금액보다 많습니다.';
      this.dupcheck = false;
    }
  }

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
   * 결제완료 후 Enter Key 치면 팝업 닫힘
   * 일반결제 : 카트 및 클라이언트 초기화
   * 복합결제 : 카트 및 클라이언트 갱신
   */
  private payFinishByEnter() {
    this.close();
  }

  close() {
    this.closeModal();
  }

  @HostListener('document:keydown', ['$event'])
  onPointKeyDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      const modalid = this.storage.getLatestModalId();
      if (modalid !== ModalIds.COMPLETE) { // 결제완료 창이 뜨지 않았을 경우만 처리
        this.doPay();
      }
    }
  }

  private doPay() {
    if (Utils.isPaymentSuccess(this.finishStatus)) {
      this.payFinishByEnter();
    } else if (this.finishStatus === 'fail') {
      this.info.sendInfo('recart', this.orderInfo);
      this.info.sendInfo('orderClear', 'clear');
      this.close();
    } else {
      if (!this.dupcheck) {
        setTimeout(() => { this.payPoint(); }, 300);
        this.dupcheck = true;
      }
    }
  }

  protected doPageUp(evt: any) {
    this.checkPay(0);
  }

  protected doPageDown(evt: any) {
    this.checkPay(1);
  }

  private handleKeyboardCommand(command: KeyCommand) {
    try {
      this[command.name](command.ev);
    } catch (e) {
      this.logger.set('keyboard.component', `[${command.combo}] key event, [${command.name}] undefined function!`).info();
    }
  }

}
