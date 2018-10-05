import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { CashReceiptComponent } from '../ways/cash-receipt/cash-receipt.component';
import {
  ModalComponent, ModalService, PrinterService, StorageService,
  KeyboardService, KeyCommand, Modal, Logger, CardCancelResult, NicePaymentService, SpinnerService, ICCardCancelResult
} from '../../../core';
import { Order } from '../../../data/models/order/order';
import { Cart } from '../../../data/models/order/cart';
import {
  Accounts, PaymentCapture, StatusDisplay, KeyCode, CapturePaymentInfo, AmwayExtendedOrdering,
  ReceiptInfoData, ModalIds, CreditCardPaymentInfo, ICCardPaymentInfo, ErrorType, MemberType
} from '../../../data';
import { ReceiptService, PaymentService, MessageService, CartService } from '../../../service';
import { InfoBroker } from '../../../broker';
import { Utils } from '../../../core/utils';

/**
 * 결제 완료 컴포넌트
 * 모든 결제 수행 시 최종 결제 완료 창을 출력해야함.
 * 카드결제 시 최소 결제 금액은 200원 이상임.
 */
@Component({
  selector: 'pos-complete-payment',
  templateUrl: './complete-payment.component.html'
})
export class CompletePaymentComponent extends ModalComponent implements OnInit, OnDestroy {
  finishStatus: string;                                // 결제완료 상태
  apprmessage: string;
  paidDate: Date;
  paidamount: number;
  payamount: number;
  change: number;
  checktype: number;
  orderType: string;
  receiptenable: boolean;
  private dupcheck = false;
  private bernumber: string;
  private orderInfo: Order;
  private cartInfo: Cart;
  private amwayExtendedOrdering: AmwayExtendedOrdering;
  private accountInfo: Accounts;
  private paymentcapture: PaymentCapture;
  private paymentsubscription: Subscription;
  private alertsubscription: Subscription;
  private keyboardsubscription: Subscription;
  private cartsubscription: Subscription;

  // spinnerService 는 HostListener 사용중
  constructor(protected modalService: ModalService, private printer: PrinterService, private receipt: ReceiptService,
    private payments: PaymentService, private nicepay: NicePaymentService, private cart: CartService,
    private keyboard: KeyboardService, private storage: StorageService, private message: MessageService,
    private modal: Modal, private spinner: SpinnerService, private info: InfoBroker, private logger: Logger, private cartService: CartService
  ) {
    super(modalService);
    this.finishStatus = null;
    this.orderType = null;
    this.paidamount = 0;
    this.change = 0;
    this.checktype = 0;
    this.bernumber = null;
    this.receiptenable = false;
  }

  ngOnInit() {
    this.keyboardsubscription = this.keyboard.commands.subscribe(c => {
      this.handleKeyboardCommand(c);
    });
    this.accountInfo = this.callerData.account;
    this.cartInfo = this.callerData.cartInfo;
    this.amwayExtendedOrdering = this.callerData.amwayExtendedOrdering;
    this.paymentcapture = this.callerData.paymentInfo;
    this.paidamount = this.cartService.getTotalPriceWithTax(this.cartInfo); // this.cartInfo.totalPrice.value; // 내신금액
    this.payamount = this.cartService.getTotalPriceWithTax(this.cartInfo); // this.cartInfo.totalPrice.value;  // 결제금액
    this.paidamount = this.calAmountByPayment();
    this.calChange(); // 거스름돈
    this.dupcheck = true; // pay하는 도중에 ENTER가 들어오면 다른 함수 실행됨.
    if (this.paidamount >= this.payamount) { // 최종 결제 금액 validation 체크
      setTimeout(() => { this.pay(); }, 50);  // 결제완료 창에서 바로 결제를 전행하여 ENTER키 입력을 줄임.
    } else {
      this.checktype = -999;
      this.apprmessage = '결제할 금액이 맞지않습니다.';
    }
  }

  ngOnDestroy() {
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    if (this.alertsubscription) { this.alertsubscription.unsubscribe(); }
    if (this.keyboardsubscription) { this.keyboardsubscription.unsubscribe(); }
    if (this.cartsubscription) { this.cartsubscription.unsubscribe(); }
  }

  payButton(evt: any) {
    if (this.checktype === -999) { // 결제금액이 맞지 않음.
      this.storage.removePay();
      this.storage.removePaymentCapture();
      this.info.sendInfo('invalidpayment', true); 
      this.close();
    }    
    if (this.finishStatus === ErrorType.RECART) {
      this.cardCancelAndSendInfoForError();
    } else if (this.finishStatus === ErrorType.FAIL) {
      this.cardCancelAndSendInfoForError(ErrorType.API);
    } else if (this.finishStatus === ErrorType.CARDFAIL) {
      this.sendCartClearOrRecart();
    } else if (this.finishStatus === ErrorType.NOORDER) {
      this.cardCancelAndSendInfoForError();
    } else if (this.finishStatus === ErrorType.RESTRICT) {
      this.cardCancelAndSendInfoForError();
    } else if (this.finishStatus !== StatusDisplay.ERROR) {
      if (!this.dupcheck) {
        setTimeout(() => { this.payFinishByEnter(); }, 300);
        this.dupcheck = true;
      }
    }
  }

  /**
   * 결제 처리
   *
   * @param evt 이벤트
   */
  private pay(): void {
    if (this.finishStatus !== null) {
      if (Utils.isPaymentSuccess(this.finishStatus)) {
        if (!this.dupcheck) {
          setTimeout(() => { this.payFinishByEnter(); }, 300);
          this.dupcheck = true;
        }
      }
      return;
    }
    const calpaid = this.calAmountByPayment();
    if (calpaid >= this.payamount) { // payment capture 와 place order (한꺼번에) 실행
      if (Utils.isEmpty(this.storage.getPaymentModeCode())) {
        this.checktype = -1;
        this.dupcheck = false;
        this.apprmessage = this.message.get('not.choose.payment');
      } else {
        this.checktype = 0;
        this.paymentCaptureAndPlaceOrder();
      }
    }
  }

  /**
   * 전체 결재 금액 계산
   * 내신금액(받은금액) 은 모든 결제수단의 합계임.
   */
  private calAmountByPayment(): number {
    let paid = 0;
    if (this.paymentcapture.ccPaymentInfo) { // 신용카드
      const p = this.paymentcapture.ccPaymentInfo.amount;
      if (p) { paid += Number(p); }
    }
    if (this.paymentcapture.cashPaymentInfo) { // 현금결제
      const p = this.paymentcapture.cashPaymentInfo.amount;
      if (p) { paid += Number(p); }
      paid += this.calChange();
    }
    if (this.paymentcapture.directDebitPaymentInfo) { // 자동이체
      const p = this.paymentcapture.directDebitPaymentInfo.amount;
      if (p) { paid += Number(p); }
    }
    if (this.paymentcapture.voucherPaymentInfo) { } // 쿠폰결제
    if (this.paymentcapture.pointPaymentInfo) { // 포인트결제
      const p = this.paymentcapture.pointPaymentInfo.amount;
      if (p) { paid += Number(p); }
    }
    if (this.paymentcapture.monetaryPaymentInfo) { // 미수금결제(AR)
      const p = this.paymentcapture.monetaryPaymentInfo.amount;
      if (p) { paid += Number(p); }
    }
    if (this.paymentcapture.icCardPaymentInfo) { // 현금IC카드결제
      const p = this.paymentcapture.icCardPaymentInfo.amount;
      if (p) { paid += Number(p); }
    }
    return paid;
  }

  /**
   * 거스름돈 설정
   */
  private calChange(): number {
    if (this.paymentcapture.cashPaymentInfo) { // 현금결제
      const strchange = this.paymentcapture.cashPaymentInfo.change;
      this.change = strchange ? Number(strchange) : 0;
      return this.change;
    }
    return 0;
  }

  /**
   * 주결제 수단 설정 및 결제 정보 캡쳐
   * 주결재 수단은 첫번째 선택한 결제 수단이 주결제 수단이나
   * POS에서는 ABN 처럼 명확하게 알 수 없기 때문에
   * 우선순위에 따라 주결제 수단을 세팅함.
   * 우선순위는 아래와 같음.
   *  1. 자동이체 2. 카드 3. 현금 4.포인트
   * 그 이외에는 선택한 결제수단을 넣어줌.
   */
  private paymentCaptureAndPlaceOrder() {
    const capturepaymentinfo = new CapturePaymentInfo();
    capturepaymentinfo.paymentModeCode = this.payments.getPaymentModeCode(this.paymentcapture); // this.storage.getPaymentModeCode();
    capturepaymentinfo.capturePaymentInfoData = this.paymentcapture;
    capturepaymentinfo.receiptInfoData = this.setBerInfo(); // 중개주문 설정하기
    this.logger.set('complete.payment.component', 'payment capture : ' + Utils.stringify(this.paymentcapture)).debug();
    this.paymentsubscription = this.payments.placeOrder(this.accountInfo.parties[0].uid, this.cartInfo.code, capturepaymentinfo).subscribe(
      result => {
        this.orderInfo = result;
        this.finishStatus = result.statusDisplay;
        if (Utils.isNotEmpty(result.code)) { // 결제정보가 있을 경우
          this.logger.set('complete.payment.component', `payment capture and place order(${result.code}) : ${result.status}, status display : ${result.statusDisplay}`).debug();
          // if (result.statusDisplay === StatusDisplay.ERROR) {
          if (Utils.isPaymentError(result.statusDisplay)) {
            let failmsg = '';
            if (result.statusDisplay === StatusDisplay.PAYMENTFAILED) {
              failmsg = this.message.get('payment.failed');
            } else if (result.statusDisplay === StatusDisplay.ORDERFAILED) {
              failmsg = this.message.get('order.failed');
            }
            this.finishStatus = ErrorType.RECART; // 결제 정보가 있을 경우 에러발생하면 CART 가 삭제되었으므로 장바구니 재생성
            if (result.code.startsWith('PR')) {
              this.apprmessage = this.message.get('payment.fail.reject') + failmsg;
            } else if (result.code.startsWith('PE')) {
              this.apprmessage = this.message.get('payment.fail.error') + failmsg;
            } else {
              this.apprmessage = this.message.get('payment.fail') + failmsg;
            }
          } else {
            this.popupCashReceipt(); // 현금성 거래 (리캐시, 자동이체, 현금) 일 때는 무조건 현금 영수증 창이 뜸
            this.orderType = result.orderType.code;
            this.paidDate = result.created ? result.created : new Date();
            this.apprmessage = this.message.get('payment.success'); // '결제가 완료되었습니다.';
            this.payments.sendPaymentAndOrderInfo(this.paymentcapture, this.orderInfo);
          }
        } else if (result.cartModifications) { // Restriction
          this.finishStatus = ErrorType.RESTRICT;
          let appendMessage = '';
          result.cartModifications[0].messages.forEach(message => {
            const msg = this.message.get(message.message) ? this.message.get(message.message) : message.message;
            if (appendMessage === '') {
              appendMessage += msg;
            } else {
              appendMessage += '<br/>' + msg;
            }
          });
          this.apprmessage = appendMessage;
        } else { // 결제정보 없는 경우, CART 삭제되지 않은 상태, 다른 지불 수단으로 처리
          this.finishStatus = ErrorType.NOORDER;
          this.apprmessage = this.message.get('payment.fail.other');
        }
        this.dupcheck = false;
        this.storage.removePay();
      }, error => {
        this.checktype = -1;
        this.dupcheck = false;
        this.finishStatus = ErrorType.FAIL; // 카트가 있는지 조회하여 있으면 닫고 없으면 재생성
        try {
          const errdata = Utils.getError(error);
          if (errdata && errdata.message) {
            this.logger.set('complete.payment.component', `${errdata.message}`).error();
            this.apprmessage = errdata.message;
          } else {
            this.apprmessage = this.payments.paymentError(error);
          }
        } catch (e) {
          this.apprmessage = this.message.get('error.occurred');
        }
      });
  }

  /**
   * 화면에 성공인 경우 와 실패인 경우 메시지를
   * 뿌려주기 위한 구분 플래그
   */
  isPaymentSuccessFlag() {
    if (this.finishStatus !== null) {
      if (
        this.finishStatus !== StatusDisplay.ERROR
        &&
        this.finishStatus !== StatusDisplay.PAYMENTFAILED
        &&
        this.finishStatus !== StatusDisplay.ORDERFAILED
        &&
        this.finishStatus !== ErrorType.FAIL
        &&
        this.finishStatus !== ErrorType.NOORDER
        ) {
          return true; // 성공 화면
        }
        return false; // 실패 화면
    }
    return false;
  }

  /**
   * 일반 결제 오류인 경우 카드결제 취소 및 후속 처리하기
   */
  private cardCancelAndSendInfoForError(errorType?: string) {
    const p: PaymentCapture = this.paymentcapture;
    if (p.ccPaymentInfo) {
      this.doCreditCardCancel(p.ccPaymentInfo, errorType);
    } else if (p.icCardPaymentInfo) {
      this.doICCardCancel(p.icCardPaymentInfo, errorType);
    } else {
      this.sendCartClearOrRecart(errorType);
    }
  }

  /**
   * 결제 완료나 결제 취소 시 오류로 인한 후속 처리로
   * 카트에 이벤트 전송하기
   */
  private sendCartClearOrRecart(errorType = 'N') {
    if (errorType === ErrorType.API) { // 카트있는지 조회해서 있으면 닫고 없으면 재생성
      const uid = this.accountInfo.accountTypeCode === MemberType.ABO ? this.accountInfo.uid : this.accountInfo.parties[0].uid;
      this.cartsubscription = this.cart.getCartList(uid, this.cartInfo.code).subscribe(
        result => {
          this.close();
        },
        error => {
          this.info.sendInfo('recart', this.orderInfo);
          this.info.sendInfo('orderClear', 'clear');
          this.close();
        });
    } else {
      if (this.finishStatus === ErrorType.CARDFAIL) {
        this.info.sendInfo('orderClear', 'clear');
        this.close();
      } else if (this.finishStatus === ErrorType.RECART) { // 카트 재생성
        this.info.sendInfo('recart', this.orderInfo);
        this.info.sendInfo('orderClear', 'clear');
        this.close();
      } else if (this.finishStatus === ErrorType.NOORDER) {
        this.storage.removePay(); // 금액을 초기화해서 다시 결제하도록함.
        this.close();
      } else if (this.finishStatus === ErrorType.RESTRICT) {
        this.storage.removePay();
        this.close();
      }
    }
  }

  /**
   * 신용카드 결제 취소
   *
   */
  private doCreditCardCancel(cc: CreditCardPaymentInfo, errorType = 'N') {
    if (cc) {
      this.apprmessage = this.message.get('do.card.canceld', '신용카드');
      const amount: number = cc.amount;
      const apprdate: string = cc.cardRequestDate ? cc.cardRequestDate.replace(/\-/g, '').substring(2, 8) : '';
      const apprnumber: string = cc.cardApprovalNumber;
      const installment: string = cc.installmentPlan;
      const resultNotifier: Subject<CardCancelResult> = this.nicepay.cardCancel(String(amount), apprnumber, apprdate, installment);
      resultNotifier.subscribe(
        (res: CardCancelResult) => {
          this.spinner.hide();
          if (res.approved) {
            this.logger.set('complete.payment.component', 'credit card cancel success').debug();
          } else {
            this.finishStatus = ErrorType.CARDFAIL;
            this.apprmessage = `${res.resultMsg1} ${res.resultMsg2}`;
            this.logger.set('complete.payment.component', `credit card cancel error : ${res.resultMsg1} ${res.resultMsg2}`).error();
          }
          setTimeout(() => { this.sendCartClearOrRecart(errorType); }, 350);
        },
        error => {
          this.spinner.hide();
          this.logger.set('complete.payment.component', `${error}`).error();
        },
        () => { this.spinner.hide(); }
      );
    }
  }

  /**
   * 현금IC카드 결제 취소
   *
   */
  private doICCardCancel(ic: ICCardPaymentInfo, errorType = 'N') {
    if (ic) {
      this.apprmessage = this.message.get('do.card.canceld', '현금IC카드');
      const amount: number = ic.amount;
      const apprdate: string = ic.cardRequestDate ? ic.cardRequestDate.replace(/\-/g, '').substring(2, 8) : '';
      const resultNotifier: Subject<ICCardCancelResult> = this.nicepay.icCardCancel(String(amount), apprdate, apprdate);
      resultNotifier.subscribe(
        (res: ICCardCancelResult) => {
          this.spinner.hide();
          if (res.approved) {
            this.logger.set('complete.payment.component', 'ic card cancel success').debug();
          } else {
            this.finishStatus = ErrorType.CARDFAIL; // 'cardfail';
            this.apprmessage = `${res.resultMsg1} ${res.resultMsg2}`;
            this.logger.set('complete.payment.component', `ic card cancel error : ${res.resultMsg1} ${res.resultMsg2}`).error();
          }
          setTimeout(() => { this.sendCartClearOrRecart(errorType); }, 350);
        },
        error => {
          this.spinner.hide();
          this.logger.set('complete.payment.component', `${error}`).error();
        },
        () => { this.spinner.hide(); }
      );
    }
  }


  /**
   * 영수증 출력 및 카트 초기화
   *
   * @param isCashReceipt 현금영수증 증빙 여부
   */
  private printAndCartInit(isCashReceipt?: boolean) {
    if (this.finishStatus !== StatusDisplay.ERROR) {
      if (this.amwayExtendedOrdering !== undefined) {
        this.receipt.groupPrint(this.orderInfo, this.paymentcapture, false, isCashReceipt);
        this.sendPaymentAndOrder(this.paymentcapture, this.orderInfo);
      } else {
        // businessEntityRegistration 유: 중개판매, 무: 현장구매
        const type = this.orderInfo.receiptInfo.businessEntityRegistration ? this.message.get('mediateOrder.order.type') : this.message.get('default.order.type');
        const params = {
          isCashReceipt: isCashReceipt,
          type: type
        };
        this.receipt.print(this.accountInfo, this.cartInfo, this.orderInfo, this.paymentcapture, params);
        this.sendPaymentAndOrder(this.paymentcapture, this.orderInfo);
      }
    }
  }

  /**
   * 중개주문일 경우 Payment 정보에 중개주문 정보를 설정함.
   * 중개주문을 설정할 경우 현금영수증 증빙되지 않도록 처리.
   */
  private setBerInfo(): ReceiptInfoData {
    this.bernumber = this.storage.getBer();
    if (Utils.isEmpty(this.bernumber)) {
      return null;
    } else {
      this.storage.removeBer(); // 처리 후에는 초기화함.
      this.receiptenable = false; // 중개주문인 경우는 현금영수증 증빙 못하도록 처리
      return new ReceiptInfoData(this.bernumber);
    }
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
   * 창닫기 시 오류 처리 및 창닫기
   */
  escapeAndClose() {
    if (this.finishStatus) {
      if (this.finishStatus === ErrorType.RECART) { // 카트 재생성
        this.cardCancelAndSendInfoForError(); // 카드 결제 취소하기 및 후속 처리하기
      } else if (this.finishStatus === ErrorType.FAIL) { // API 오류
        this.cardCancelAndSendInfoForError(ErrorType.API);
      } else if (this.finishStatus === ErrorType.CARDFAIL) {
        this.sendCartClearOrRecart();
      } else if (this.finishStatus === ErrorType.NOORDER) { // 주문정보 없음 다른 결제 수단
        this.close();
      } else if (this.finishStatus === ErrorType.RESTRICT) {
        this.cardCancelAndSendInfoForError(ErrorType.RESTRICT);
      } else {
        this.close();
      }
    } else {
      this.close();
    }
  }

  /**
   * 영수증 출력 팝업 : 키보드에서 현금영수증 버튼 선택 시, 현금영수증 팝업
   * 중개주문인 경우는 영수증 증빙 출력하지 않음.
   */
  protected popupCashReceipt() {
    if (Utils.isEmpty(this.bernumber)) { // 중개주문인 경우는 영수증 출력하지 않음.
      const modalid = this.storage.getLatestModalId();
      if (modalid && modalid === ModalIds.CASHRECEIPT) { return; }
      if (this.finishStatus !== StatusDisplay.ERROR) {
        if (this.isReceiptEnable()) { // 현금, Recash, 자동이체 인 경우 출력
          this.modal.openModalByComponent(CashReceiptComponent, {
            callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo, orderInfo: this.orderInfo, paymentCapture: this.paymentcapture },
            closeByClickOutside: false,
            modalId: ModalIds.CASHRECEIPT,
            paymentType: 'c'
          }).subscribe(result => {
            if (result && result === '200') {
              this.payFinishByEnter(true); // 현금영수증 출력.
            }
          });
        }
      }
    } else {
      this.receiptenable = false;
    }
  }

  isReceiptEnable(): boolean {
    if (this.paymentcapture.cashPaymentInfo // 현금
      || this.paymentcapture.monetaryPaymentInfo // AP
      || this.paymentcapture.directDebitPaymentInfo // 자동이체
    ) {
      this.receiptenable = true;
      return true;
    }
    this.receiptenable = false;
    return false;
  }

  /**
   * 결제 최종 엔터키 입력 시
   *
   * @param isCashReceipt 현금영수증 증빙 여부
   */
  private payFinishByEnter(isCashReceipt?: boolean) {
    if (this.finishStatus !== StatusDisplay.ERROR) {
      if (this.paymentcapture.cashPaymentInfo && this.paymentcapture.cashPaymentInfo.amount > 0) { // 현금결제가 있으면 캐셔 drawer 오픈
        this.printer.openCashDrawer(); // cash drawer open
        this.payments.cashDrawerLogging().subscribe( // cash drawer open logging
          result => {
            this.logger.set('complete.payment.component', `${result.returnMessage}`).debug();
            this.printAndCartInit(isCashReceipt);
            this.storage.removePaymentModeCode(); // 주결제 수단 세션 정보 삭제
            this.storage.removePay(); // 복합결제 남은 금액 정보 초기화
            this.info.sendInfo('orderClear', 'clear');
            this.close();
          },
          error => {
            const errdata = Utils.getError(error);
            if (errdata) {
              this.logger.set('complete.payment.component', `${errdata.message}`).error();
            }
          });
      } else {
        this.printAndCartInit(isCashReceipt);
        this.storage.removePaymentModeCode(); // 주결제 수단 세션 정보 삭제
        this.storage.removePay(); // 복합결제 남은 금액 정보 초기화
        this.info.sendInfo('orderClear', 'clear');
        this.close();
      }
    }
  }

  @HostListener('document:keydown', ['$event', 'this.spinner.status()'])
  onPaymentdDown(event: any, isSpinnerStatus: boolean) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER && !isSpinnerStatus) {
      const modalid = this.storage.getLatestModalId();
      if (modalid !== ModalIds.SERIAL && modalid !== ModalIds.CASHRECEIPT) {
        if (this.checktype === -999) { // 결제금액이 맞지 않음.
          this.storage.removePay();
          this.storage.removePaymentCapture();
          this.info.sendInfo('invalidpayment', true); 
          this.close();
        }
        if (this.finishStatus === ErrorType.RECART) { // 카트 재생성
          this.cardCancelAndSendInfoForError(); // 카드 결제 취소하기 및 후속 처리하기
        } else if (this.finishStatus === ErrorType.FAIL) { // API 오류
          this.cardCancelAndSendInfoForError(ErrorType.API); // 카드 결제 취소하기 및 카트 조회 후 후속 처리하기
        } else if (this.finishStatus === ErrorType.NOORDER) { // 주문정보 없음 다른 결제 수단
          this.close();
        } else if (this.finishStatus === ErrorType.RESTRICT) {
          this.cardCancelAndSendInfoForError(ErrorType.RESTRICT);
        } else if (this.finishStatus !== StatusDisplay.ERROR) {
          if (!this.dupcheck) {
            setTimeout(() => { this.payFinishByEnter(); }, 300);
            this.dupcheck = true;
          }
        }
      }
    } else if (event.keyCode === KeyCode.ESCAPE) {
      // this.escapeAndClose();
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
      this[command.name]();
    } catch (e) {
      this.logger.set('complete.payment.component', `[${command.combo}] key event, [${command.name}] undefined function!`).info();
    }
  }

}
