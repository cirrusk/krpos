import { Component, OnInit, HostListener, ElementRef, ViewChild, Renderer2, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AlertService, AlertState } from '../../../../core/alert/alert.service';
import {
  ModalComponent, ModalService, KeyCommand, KeyboardService,
  PrinterService, SpinnerService, Logger, Modal, StorageService
} from '../../../../core';
import { MessageService, PaymentService, ReceiptService } from '../../../../service';
import {
  Accounts, PaymentCapture, PaymentModes, CashType, CashPaymentInfo, PaymentModeData,
  CurrencyData, KeyCode, StatusDisplay
} from '../../../../data';
import { Cart } from '../../../../data/models/order/cart';
import { CashReceiptComponent } from '../cash-receipt/cash-receipt.component';
import { Utils } from '../../../../core/utils';
import { InfoBroker } from '../../../../broker';
import { Order } from '../../../../data/models/order/order';

@Component({
  selector: 'pos-cash',
  templateUrl: './cash.component.html'
})
export class CashComponent extends ModalComponent implements OnInit, OnDestroy {

  @ViewChild('paid') private paid: ElementRef;         // 내신금액
  @ViewChild('payment') private payment: ElementRef;   // 결제금액
  @ViewChild('paycheck') private paycheck: ElementRef; // 결제확인버튼
  finishStatus: string;                                // 결제완료 상태
  paidDate: Date;
  private orderInfo: Order;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private paymentcapture: PaymentCapture;
  private paymentType: string;
  private point; number;
  private keyboardsubscription: Subscription;
  private paymentsubscription: Subscription;
  private alertsubscription: Subscription;
  constructor(protected modalService: ModalService,
    private message: MessageService,
    private modal: Modal,
    private printer: PrinterService,
    private receipt: ReceiptService,
    private payments: PaymentService,
    private alert: AlertService,
    private storage: StorageService,
    private spinner: SpinnerService,
    private keyboard: KeyboardService,
    private info: InfoBroker,
    private logger: Logger,
    private renderer: Renderer2) {
    super(modalService);
    this.finishStatus = null;
  }

  ngOnInit() {
    this.keyboardsubscription = this.keyboard.commands.subscribe(c => {
      this.handleKeyboardCommand(c);
    });
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    if (this.callerData.paymentCapture) { this.paymentcapture = this.callerData.paymentCapture; }
    setTimeout(() => {
      this.paid.nativeElement.value = 0;
      this.paid.nativeElement.select();
      this.paid.nativeElement.focus();
    }, 50);

    if (this.paymentType === 'n') {
      this.payment.nativeElement.value = this.cartInfo.totalPrice.value;
      // setTimeout(() => { this.renderer.setAttribute(this.payment.nativeElement, 'readonly', 'readonly'); }, 5);
    } else {
      if (this.storage.getPay() === 0) {
        this.payment.nativeElement.value = this.cartInfo.totalPrice.value;
      } else {
        this.payment.nativeElement.value = this.storage.getPay();
      }
    }
  }

  ngOnDestroy() {
    if (this.keyboardsubscription) { this.keyboardsubscription.unsubscribe(); }
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    if (this.alertsubscription) { this.alertsubscription.unsubscribe(); }
  }

  /**
   * 현금 결제 처리
   *
   * @param paidAmount 내신금액
   * @param payAmount 결제금액
   */
  pay(evt: KeyboardEvent, paidAmount: number, payAmount: number): void {
    evt.preventDefault();
    if (this.finishStatus !== null) {
      return;
    }
    // setTimeout(() => { this.paycheck.nativeElement.blur(); this.renderer.setAttribute(this.paycheck.nativeElement, 'disabled', 'disabled'); }, 5);
    // 유효성체크 실패 시 포커스 이동 처리
    this.alertsubscription = this.alert.alertState.subscribe(
      (state: AlertState) => {
        if (!state.show) {
          setTimeout(() => {
            this.paid.nativeElement.focus();
            this.paid.nativeElement.select();
            this.renderer.setAttribute(this.paycheck.nativeElement, 'disabled', '');
          }, 5);
        }
      }
    );
    const change = paidAmount - payAmount;

    if (paidAmount < 1) {
      this.alert.warn({ message: this.message.get('notinputPaid') });
    } else if (change < 0) {
      this.alert.warn({ message: this.message.get('notEnoughPaid') });
    } else {
      if (paidAmount >= payAmount) { // payment capture 와 place order (한꺼번에) 실행
        if (this.paymentType === 'n') {
          this.paymentAndCapture(payAmount, paidAmount, change);
        } else {
          if (paidAmount === payAmount) {
            this.paymentAndCapture(payAmount, paidAmount, change);
          } else if (paidAmount > payAmount) {
            this.paymentcapture = this.makePaymentCaptureData(payAmount, paidAmount, change);
            this.result = this.paymentcapture;
            this.finishStatus = StatusDisplay.PAID;
          }
        }
      }
    }
  }

  private paymentAndCapture(payAmount: number, paidAmount: number, change: number) {
    this.spinner.show();
    this.paymentcapture = this.makePaymentCaptureData(payAmount, paidAmount, change);
    this.logger.set('cash.component', 'cash payment : ' + Utils.stringify(this.paymentcapture)).debug();
    this.paymentsubscription = this.payments.placeOrder(this.accountInfo.uid, this.accountInfo.parties[0].uid, this.cartInfo.code, this.paymentcapture).subscribe(result => {
      this.orderInfo = result;
      this.logger.set('cash.component', `payment capture and place order status : ${result.status}, status display : ${result.statusDisplay}`).debug();
      this.finishStatus = result.statusDisplay;
      if (Utils.isNotEmpty(result.code)) { // 결제정보가 있을 경우
        if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
          this.paidDate = result.created ? result.created : new Date();
          setTimeout(() => {
            this.payment.nativeElement.blur(); // keydown.enter 처리 안되도록
            this.renderer.setAttribute(this.paid.nativeElement, 'readonly', 'readonly');
            this.renderer.setAttribute(this.payment.nativeElement, 'readonly', 'readonly');
          }, 5);
          this.info.sendInfo('payinfo', [this.paymentcapture, this.orderInfo]);
          this.printer.openCashDrawer(); // 캐셔 drawer 오픈
        } else if (this.finishStatus === StatusDisplay.PAYMENTFAILED) { // CART 삭제되지 않은 상태, 다른 지불 수단으로 처리
        } else { // CART 삭제된 상태
        }
      } else { // 결제정보 없는 경우, CART 삭제 --> 장바구니의 entry 정보로 CART 재생성
        // cart-list.component에 재생성 이벤트 보내서 처리
      }
      this.storage.removePay();
    }, error => {
      this.finishStatus = 'fail';
      this.spinner.hide();
      const errdata = Utils.getError(error);
      if (errdata) {
        this.logger.set('cash.component', `${errdata.message}`).error();
      }
    }, () => { this.spinner.hide(); });
  }

  /**
   * 내신금액에서 엔터키 입력 시 결제금액으로 이동
   */
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
        callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo, orderInfo: this.orderInfo, paymentcapture: this.paymentcapture },
        closeByClickOutside: false,
        modalId: 'CashReceiptComponent',
        paymentType: this.paymentType
      }
    );
  }

  /**
   * Payment Capture 데이터 생성
   *
   * @param paidamount 지불 금액
   */
  private makePaymentCaptureData(paidamount: number, received: number, change: number): PaymentCapture {
    const cash = new CashPaymentInfo(paidamount, CashType.CASH);
    cash.setReceived = received;
    cash.setChange = change;
    cash.setPaymentModeData = new PaymentModeData(PaymentModes.CASH);
    cash.setCurrencyData = new CurrencyData();
    if (this.paymentcapture) {
      if (this.paymentType === 'n') {
        const paymentcapture = new PaymentCapture();
        paymentcapture.setCashPaymentInfo = cash;
        return paymentcapture;
      } else {
        this.paymentcapture.setCashPaymentInfo = cash;
        return this.paymentcapture;
      }
    } else {
      const paymentcapture = new PaymentCapture();
      paymentcapture.setCashPaymentInfo = cash;
      return paymentcapture;
    }
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
    if (this.paymentType === 'n') { // 일반결제
      if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
        const rtn = this.receipt.print(this.accountInfo, this.cartInfo, this.orderInfo, this.paymentcapture);
        if (rtn) {
          this.logger.set('cash.component', '일반결제 장바구니 초기화...').debug();
          this.info.sendInfo('orderClear', 'clear');
        } else {
          this.alert.show({ message: '실패' });
        }
      }
      this.close();
    } else {
      const paid = this.paid.nativeElement.value;
      const payment = this.payment.nativeElement.value;
      if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
        if (paid === payment) { // 금액이 같을 경우만 영수증 출력
          const rtn = this.receipt.print(this.accountInfo, this.cartInfo, this.orderInfo, this.paymentcapture);
          if (rtn) {
            this.logger.set('cash.component', '일반결제 장바구니 초기화...').debug();
            this.info.sendInfo('orderClear', 'clear');
          } else {
            this.alert.show({ message: '실패' });
          }
        }
      }
      this.close();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyBoardDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
        this.cartInitAndClose();
      }
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
        case 'ctrl+r': { if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) { this[command.name](); } } break;
      }
    } catch (e) {
      this.logger.set('cash.component', `[${command.combo}] key event, [${command.name}] undefined function!`).error();
    }
  }
}
