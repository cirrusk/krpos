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
  CurrencyData, KeyCode, StatusDisplay, CapturePaymentInfo
} from '../../../../data';
import { Cart } from '../../../../data/models/order/cart';
import { CashReceiptComponent } from '../cash-receipt/cash-receipt.component';
import { Utils } from '../../../../core/utils';
import { InfoBroker } from '../../../../broker';
import { Order } from '../../../../data/models/order/order';
import { CompletePaymentComponent } from '../../complete-payment/complete-payment.component';
import { SerialComponent } from '../../../scan/serial/serial.component';

@Component({
  selector: 'pos-cash',
  templateUrl: './cash.component.html'
})
export class CashComponent extends ModalComponent implements OnInit, OnDestroy {

  @ViewChild('paid') private paid: ElementRef;         // 내신금액
  @ViewChild('payment') private payment: ElementRef;   // 결제금액
  paylock: boolean;                                    // 결제버튼잠금
  finishStatus: string;                                // 결제완료 상태
  paidDate: Date;
  checktype: number;
  apprmessage: string;
  private orderInfo: Order;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private paymentcapture: PaymentCapture;
  private paymentType: string;
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
    this.checktype = 0;
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

    if (this.paymentType === 'n') { // 일반결제
      this.payment.nativeElement.value = this.cartInfo.totalPrice.value;
      // setTimeout(() => { this.renderer.setAttribute(this.payment.nativeElement, 'readonly', 'readonly'); }, 5);
    } else { // 복합결제
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
   * ABO	현금(수표)	A포인트	Recash			쿠폰
   * Member	현금(수표)	M포인트
   * 소비자	현금(수표)
   *
   * @param receivedAmount 내신금액
   * @param payAmount 결제금액
   */
  pay(evt: KeyboardEvent, receivedAmount: number, payAmount: number): void {
    evt.preventDefault();
    if (this.finishStatus !== null) {
      return;
    }
    this.paySubmitLock(true);
    // 유효성체크 실패 시 포커스 이동 처리
    this.alertsubscription = this.alert.alertState.subscribe(
      (state: AlertState) => {
        if (!state.show) {
          setTimeout(() => {
            this.paid.nativeElement.focus();
            this.paid.nativeElement.select();
          }, 5);
        }
      }
    );
    const nReceiveAmount = Number(receivedAmount);
    const nPayAmount = Number(payAmount);
    if (nReceiveAmount < 1) {
      this.paySubmitLock(false); // 버튼 잠금 해제
      this.checktype = -1;
      this.apprmessage = this.message.get('notinputPaid');
      return;
    }
    const change = nReceiveAmount - nPayAmount;
    if (this.paymentType === 'n') { // 일반결제인 경우
      if (change >= 0) {
        this.paymentAndCapture(nPayAmount, nReceiveAmount, change);
      } else {
        this.paySubmitLock(false); // 버튼 잠금 해제
        this.checktype = -2;
        this.apprmessage = this.message.get('notEnoughPaid');
        return;
      }
    } else { // 복합결제인 경우
      if (change >= 0) { //  거스롬돈이 있을 경우 결제완료
        this.paymentcapture = this.makePaymentCaptureData(nPayAmount, nReceiveAmount, change).capturePaymentInfoData;
        this.completePayPopup(nReceiveAmount, nPayAmount, change);
      } else { // 거스름돈이 없을 경우 결제 진행
        this.storage.setPay(nPayAmount - nReceiveAmount); // 현재까지 결제할 남은 금액(전체결제금액 - 실결제금액)을 세션에 저장
        this.paymentcapture = this.makePaymentCaptureData(nPayAmount, nReceiveAmount, change).capturePaymentInfoData;
        this.result = this.paymentcapture;
        this.finishStatus = StatusDisplay.PAID;
        this.apprmessage = this.message.get('payment.success.next'); // '결제가 완료되었습니다.';
      }
    }
  }

  private paySubmitLock(lock: boolean) {
    this.paylock = lock;
  }

  private completePayPopup(receivedAmount: number, payAmount: number, change: number) {
    this.close();
    change = (change < 0) ? 0 : change;
    this.modal.openModalByComponent(CompletePaymentComponent,
      {
        callerData: {
          account: this.accountInfo, cartInfo: this.cartInfo, paymentInfo: this.paymentcapture,
          paidAmount: receivedAmount, payAmount: payAmount, change: change
        },
        closeByClickOutside: false,
        closeByEscape: false,
        modalId: 'CompletePaymentComponent',
        paymentType: 'c'
      }
    );
  }

  /**
   * 결제 정보 캡쳐
   *
   * @param receivedAmount 내신금액
   * @param paidAmount 결제금액
   * @param change 거스름돈
   */
  private paymentAndCapture(receivedAmount: number, paidAmount: number, change: number) {
    this.spinner.show();
    const capturepaymentinfo = this.makePaymentCaptureData(receivedAmount, paidAmount, change);
    this.paymentcapture = capturepaymentinfo.capturePaymentInfoData;
    this.logger.set('cash.component', 'cash payment : ' + Utils.stringify(this.paymentcapture)).debug();
    this.paymentsubscription = this.payments.placeOrder(this.accountInfo.parties[0].uid, this.cartInfo.code, capturepaymentinfo).subscribe(result => {
      this.orderInfo = result;
      this.logger.set('cash.component', `payment capture and place order status : ${result.status}, status display : ${result.statusDisplay}`).debug();
      this.finishStatus = result.statusDisplay;
      if (Utils.isNotEmpty(result.code)) { // 결제정보가 있을 경우
        if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
          this.apprmessage = this.message.get('payment.success'); // '결제가 완료되었습니다.';
          this.paidDate = result.created ? result.created : new Date();
          setTimeout(() => {
            this.payment.nativeElement.blur(); // keydown.enter 처리 안되도록
            this.renderer.setAttribute(this.paid.nativeElement, 'readonly', 'readonly');
            this.renderer.setAttribute(this.payment.nativeElement, 'readonly', 'readonly');
          }, 5);
          // this.info.sendInfo('payinfo', [this.paymentcapture, this.orderInfo]);
          this.sendPaymentAndOrder(this.paymentcapture, this.orderInfo);
          this.printer.openCashDrawer(); // 캐셔 drawer 오픈
        } else if (this.finishStatus === StatusDisplay.PAYMENTFAILED) { // CART 삭제 --> 장바구니의 entry 정보로 CART 재생성
          this.apprmessage = this.message.get('payment.fail'); // '결제에 실패했습니다.';
          this.finishStatus = 'recart';
        } else { // CART 삭제된 상태
          this.apprmessage = this.message.get('payment.fail'); // '결제에 실패했습니다.';
          this.finishStatus = 'recart';
        }
      } else { // 결제정보 없는 경우,  CART 삭제되지 않은 상태, 다른 지불 수단으로 처리
        // cart-list.component에 재생성 이벤트 보내서 처리
        this.finishStatus = 'fail';
        this.apprmessage = this.message.get('payment.fail'); // '결제에 실패했습니다.';
      }
      this.storage.removePay();
    }, error => {
      this.finishStatus = 'fail';
      this.spinner.hide();
      const errdata = Utils.getError(error);
      if (errdata) {
        this.apprmessage = errdata.message;
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
  private makePaymentCaptureData(paidamount: number, received: number, change: number): CapturePaymentInfo {
    let paidamountbypayment = paidamount;
    if (this.paymentType === 'c') {
      if (Number(paidamount) > Number(received)) {
        paidamountbypayment = received;
      }
    }
    const capturepaymentinfo = new CapturePaymentInfo();
    const cash = new CashPaymentInfo(paidamountbypayment, CashType.CASH);
    cash.setReceived = received;
    cash.setChange = change < 0 ? 0 : change;
    cash.setPaymentModeData = new PaymentModeData(PaymentModes.CASH);
    cash.setCurrencyData = new CurrencyData();
    if (this.paymentcapture) {
      if (this.paymentType === 'n') {
        const paymentcapture = new PaymentCapture();
        paymentcapture.setCashPaymentInfo = cash;
        capturepaymentinfo.setPaymentModeCode = PaymentModes.CASH;
        capturepaymentinfo.setCapturePaymentInfoData = paymentcapture;
      } else {
        this.paymentcapture.setCashPaymentInfo = cash;
        capturepaymentinfo.setPaymentModeCode = this.storage.getPaymentModeCode();
        capturepaymentinfo.setCapturePaymentInfoData = this.paymentcapture;
      }
    } else {
      const paymentcapture = new PaymentCapture();
      paymentcapture.setCashPaymentInfo = cash;
      capturepaymentinfo.setPaymentModeCode = this.storage.getPaymentModeCode() ? this.storage.getPaymentModeCode() : PaymentModes.CASH;
      capturepaymentinfo.setCapturePaymentInfoData = paymentcapture;
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
        this.receipt.print(this.accountInfo, this.cartInfo, this.orderInfo, this.paymentcapture);
        this.info.sendInfo('orderClear', 'clear');
      }
      this.close();
    } else { // 복합결제
      const paid = this.paid.nativeElement.value; // 내신금액
      const payment = this.payment.nativeElement.value; // 결제금액
      if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
        if (paid === payment) { // 금액이 같을 경우만 영수증 출력
          this.receipt.print(this.accountInfo, this.cartInfo, this.orderInfo, this.paymentcapture);
          this.info.sendInfo('orderClear', 'clear');
        }
      }
      this.close();
    }
  }

  private hasSerialAndRfid(): number {
    // 0: 없음, 1 : SERIAL, 2: RFID, 3: SERIAL + RFID
    let rtn = 0;
    if (this.cartInfo) {
      this.cartInfo.entries.forEach(entry => {
        if (entry.product) {
          if (entry.product.serialNumber && !entry.product.rfid) {
            rtn = 1;
          }
          if (entry.product.rfid && !entry.product.serialNumber) {
            rtn = 2;
          }
          if (entry.product.rfid && entry.product.serialNumber) {
            rtn = 3;
          }
        }
      });
    }
    return rtn;
  }

  private registerSerialAndRfid() {
    const regType = this.hasSerialAndRfid();
    if (regType > 0) {
      this.modal.openModalByComponent(SerialComponent,
        {
          callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo, orderInfo: this.orderInfo },
          closeByClickOutside: false,
          modalId: 'SerialComponent',
          regType: regType
        }
      ).subscribe(result => {
        if (result) {
          this.cartInitAndClose();
        }
      });
    } else if (regType === 0) {
      this.cartInitAndClose();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyBoardDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
        // serial, rfid 가 있으면 입력팝업에서 입력 후에 cartInitAndClose
        // 아니면 cartInitAndClose
        this.cartInitAndClose();
        const lastmodal = this.storage.getLatestModalId();
        if (lastmodal !== 'SerialComponent') {
          // this.registerSerialAndRfid();
        }
        // this.cartInitAndClose();
      } else if (this.finishStatus === 'recart') {
        this.info.sendInfo('recart', this.orderInfo);
        this.info.sendInfo('orderClear', 'clear');
        this.close();
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
