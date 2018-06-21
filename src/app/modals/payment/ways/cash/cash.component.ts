import { Component, OnInit, HostListener, ElementRef, ViewChild, Renderer2, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AlertService } from '../../../../core/alert/alert.service';
import { ModalComponent, ModalService, KeyCommand, KeyboardService, Logger, Modal, PrinterService } from '../../../../core';
import { MessageService, PaymentService } from '../../../../service';
import { Accounts, PaymentCapture, PaymentModes, CashType, CashPaymentInfo, PaymentModeData, CurrencyData, KeyCode } from '../../../../data';
import { Cart } from '../../../../data/models/order/cart';
import { CashReceiptComponent } from '../cash-receipt/cash-receipt.component';

@Component({
  selector: 'pos-cash',
  templateUrl: './cash.component.html'
})
export class CashComponent extends ModalComponent implements OnInit, OnDestroy {

  @ViewChild('paid') private paid: ElementRef;    // 내신금액
  @ViewChild('payment') private payment: ElementRef; // 결제금액
  finishStatus: string;                              // 결제완료 상태
  private cartInfo: Cart;
  private account: Accounts;
  private paymentType: string;
  paidDate: Date;
  private keyboardsubscription: Subscription;
  private paymentsubscription: Subscription;
  constructor(protected modalService: ModalService,
    private message: MessageService,
    private modal: Modal,
    private printer: PrinterService,
    private payments: PaymentService,
    private alert: AlertService,
    private keyboard: KeyboardService,
    private logger: Logger,
    private renderer: Renderer2) {
    super(modalService);
  }

  ngOnInit() {
    this.keyboardsubscription = this.keyboard.commands.subscribe(c => {
      this.handleKeyboardCommand(c);
    });
    this.account = this.callerData.account;
    this.cartInfo = this.callerData.cartInfo;
    setTimeout(() => {
      this.paid.nativeElement.value = 0;
      this.paid.nativeElement.select();
      this.paid.nativeElement.focus();
    }, 50);

    if (this.paymentType === 'n') {
      this.payment.nativeElement.value = this.cartInfo.totalPrice.value;
      // setTimeout(() => { this.renderer.setAttribute(this.payment.nativeElement, 'readonly', 'readonly'); }, 5);
    } else {
      this.payment.nativeElement.value = 0;
    }

  }

  ngOnDestroy() {
    if (this.keyboardsubscription) { this.keyboardsubscription.unsubscribe(); }
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
  }

  pay(paidAmount: number, payAmount: number) {
    const change = this.paid.nativeElement.value - this.payment.nativeElement.value;
    if (paidAmount < 1) {
      this.alert.warn({ message: this.message.get('notinputPaid') });
    } else if (change < 0) {
      this.alert.warn({ message: this.message.get('notEnoughPaid') });
    } else {
      if (this.paymentType === 'n') {
        if (paidAmount >= payAmount) { // payment capture 와 place order (한꺼번에) 실행
          const paymentcapture = this.makePaymentCaptureData(payAmount);
          console.log('payment capture : ' + JSON.stringify(paymentcapture, null, 2));
          this.paymentsubscription = this.payments.placeOrder(this.account.uid, this.account.parties[0].uid, this.cartInfo.code, paymentcapture).subscribe(
            result => {
              console.log('payment capture result : ' + JSON.stringify(result, null, 2));
              console.log('status = ' + result.status);
              console.log('status display = ' + result.statusDisplay);
              this.printer.openCashDrawer(); // 현금 결제 완료 후, cash drawer 오픈
            },
            error => {
              console.log('error... ' + error);
            });
        }

        this.paidDate = new Date();
        this.finishStatus = 'ok';
      } else {
      }
    }
  }

  /**
   * Payment Capture 데이터 생성
   *
   * @param paidamount 지불 금액
   */
  private makePaymentCaptureData(paidamount: number): PaymentCapture {
    const cash = new CashPaymentInfo(CashType.CASH, paidamount);
    cash.paymentMode = new PaymentModeData(PaymentModes.CASH);
    cash.currency = new CurrencyData();
    const paymentcapture = new PaymentCapture();
    paymentcapture.cashPayment = cash;
    return paymentcapture;
  }

  nextStep() {
    const paid = this.paid.nativeElement.value;
    if (paid) {
      this.payment.nativeElement.focus();
    }
  }

  /**
   * 영수증 출력 팝업 : 키보드에서 현금영수증 버튼 선택 시, 현금영수증 팝업
   */
  protected popupCashReceipt() {
    this.modal.openModalByComponent(CashReceiptComponent,
      {
        callerData: { account: this.account, cartInfo: this.cartInfo },
        closeByClickOutside: false,
        modalId: 'CashReceiptComponent',
        paymentType: this.paymentType
      }
    );
  }

  close() {
    this.closeModal();
  }

  /**
   * 결제완료 후 Enter Key 치면 팝업 닫힘
   * 일반결제 : 카트 및 클라이언트 초기화
   * 복합결제 : 카트 및 클라이언트 갱신
   */
  cartInitAndClose() {
    if (this.paymentType === 'n' && this.finishStatus === 'ok') {
      console.log('카트를 초기화하고...');
      this.close();
    } else {
      console.log('복합결제일 경우...');
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyBoardDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      this.cartInitAndClose();
    }
  }

  /**
   * 현금영수증 버튼 선택 시에만 이벤트 처리하면됨.
   * 반드시 결제가 완료된 후에만 처리됨.
   *
   * @param command 키보드 명령어
   */
  private handleKeyboardCommand(command: KeyCommand) {
    try {
      switch (command.combo) {
        case 'ctrl+r': { if (this.finishStatus === 'ok') { this[command.name](); } } break;
      }
    } catch (e) {
      this.logger.set('cash.component', `[${command.combo}] key event, [${command.name}] undefined function!`).error();
    }
  }
}
