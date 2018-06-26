import { ICCardCancelResult } from './../../../../core/peripheral/niceterminal/vo/iccard.cancel.result';
import { Component, OnInit, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

import { ModalComponent, ModalService, NicePaymentService, Logger, AlertService, SpinnerService } from '../../../../core';
import { KeyCode, ICCardPaymentInfo, PaymentCapture, PaymentModeData, CurrencyData, PaymentModes, Accounts, StatusDisplay } from '../../../../data';
import { Order } from '../../../../data/models/order/order';
import { Cart } from '../../../../data/models/order/cart';
import { ICCardApprovalResult } from '../../../../core/peripheral/niceterminal/vo/iccard.approval.result';
import { ReceiptService, PaymentService } from '../../../../service';
import { NiceConstants } from '../../../../core/peripheral/niceterminal/nice.constants';
import { Utils } from '../../../../core/utils';
import { InfoBroker } from '../../../../broker';
@Component({
  selector: 'pos-ic-card',
  templateUrl: './ic-card.component.html'
})
export class IcCardComponent extends ModalComponent implements OnInit, OnDestroy {
  private orderInfo: Order;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private paymentcapture: PaymentCapture;
  private paymentType: string;
  private cardresult: ICCardApprovalResult;
  private paymentsubscription: Subscription;
  private enterCounter: number;
  payprice: number;
  finishStatus: string;                                // 결제완료 상태
  paidDate: Date;
  cardnumber: string; // 카드번호
  cardcompay: string; // 카드사명
  cardperiod: string; // 유효기간
  cardauthnumber: string; // 승인번호
  @ViewChild('cardpassword') private cardpassword: ElementRef;
  constructor(protected modalService: ModalService, private receipt: ReceiptService,
    private payments: PaymentService, private nicepay: NicePaymentService,
    private alert: AlertService, private spinner: SpinnerService, private info: InfoBroker, private logger: Logger) {
    super(modalService);
    this.finishStatus = null;
    this.enterCounter = 0;
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    if (this.paymentType === 'n') {
      this.payprice = this.cartInfo.totalPrice.value;
    }
  }

  ngOnDestroy() {
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
  }

  private makePaymentCaptureData(paidamount: number): PaymentCapture {
    const iccard = new ICCardPaymentInfo(paidamount);
    iccard.setAccountNumber = this.cardresult.approvalNumber;
    iccard.setBank = this.cardresult.issuerOrgName;
    iccard.setBankIDNumber = this.cardresult.issuerOrgCode;
    iccard.setBaOwner = '';
    iccard.setPaymentModeData = new PaymentModeData(PaymentModes.ICCARD);
    iccard.setCurrencyData = new CurrencyData();
    const paymentcapture = new PaymentCapture();
    paymentcapture.setIcCardPaymentInfo = iccard;
    return paymentcapture;
  }

  private nicePay() {
    if (this.paymentType === 'n') {
      this.spinner.show();
      const resultNotifier: Subject<ICCardApprovalResult> = this.nicepay.icCardApproval(String(this.payprice));
      this.logger.set('ic.card.component', 'listening on reading ic card...').debug();
      resultNotifier.subscribe(
        (res: ICCardApprovalResult) => {
          this.cardresult = res;
          if (res.code !== NiceConstants.ERROR_CODE.NORMAL) {
            this.alert.error({ message: res.msg });
            this.spinner.hide();
          } else {
            if (res.approved) {
              this.cardnumber = res.maskedCardNumber;
              this.cardcompay = res.issuerName;
              this.cardauthnumber = res.approvalNumber;
              this.paidDate = Utils.convertDate(res.approvalDateTime);

              // payment caputure
              this.paymentcapture = this.makePaymentCaptureData(this.payprice);
              this.logger.set('ic.card.component', 'ic card payment : ' + Utils.stringify(this.paymentcapture)).debug();
              this.paymentsubscription = this.payments.placeOrder(this.accountInfo.uid, this.accountInfo.parties[0].uid, this.cartInfo.code, this.paymentcapture).subscribe(
                result => {
                  this.orderInfo = result;
                  this.logger.set('ic.card.component', `payment capture and place order status : ${result.status}, status display : ${result.statusDisplay}`).debug();
                  this.finishStatus = result.statusDisplay;
                  if (Utils.isNotEmpty(result.code)) { // 결제정보가 있을 경우
                    if (this.finishStatus === StatusDisplay.PAID) {
                      this.paidDate = result.created ? result.created : new Date();

                    } else if (this.finishStatus === StatusDisplay.PAYMENTFAILED) { // CART 삭제되지 않은 상태, 다른 지불 수단으로 처리

                    } else { // CART 삭제된 상태

                    }
                  } else { // 결제정보 없는 경우, CART 삭제 --> 장바구니의 entry 정보로 CART 재생성
                    // cart-list.component에 재생성 이벤트 보내서 처리
                  }
                },
                error => {
                  this.finishStatus = 'fail';
                  this.spinner.hide();
                  const errdata = Utils.getError(error);
                  if (errdata) {
                    this.logger.set('iccard.component', `${errdata.message}`).error();
                  }
                },
                () => { this.spinner.hide(); });
            } else {
              this.finishStatus = 'fail';
              this.spinner.hide();
              this.alert.error({ message: `${res.resultMsg1} ${res.resultMsg2}` });
            }
          }
        }
      );
    }
  }

  close() {
    this.closeModal();
  }

  /**
   * ESC를 눌렀을 경우 카드 결제했으면 취소
   * 안했으면 팝업 닫기
   */
  payCancel() {
    if (this.cardresult && this.cardresult.approved) {
      const apprnum = this.cardresult.approvalNumber;
      const apprdate = this.cardresult.approvalDateTime ? this.cardresult.approvalDateTime.substring(0, 6) : '';
      const resultNotifier: Subject<ICCardCancelResult> = this.nicepay.icCardCancel(String(this.payprice), apprnum, apprdate);
      resultNotifier.subscribe(
        (res: ICCardCancelResult) => {
          if (res.approved) {
            this.logger.set('ic.card.component', 'card cancel success').debug();
          } else {
            this.logger.set('ic.card.component', `card cancel error : ${res.resultMsg1}, ${res.resultMsg2}`).error();
          }
        },
        error => { this.logger.set('ic.card.component', `${error}`).error(); },
        () => { this.close(); }
      );
    } else {
      this.close();
    }
  }

  cartInitAndClose() {
    if (this.paymentType === 'n') { // 일반결제
      if (this.finishStatus === StatusDisplay.PAID) {
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
      console.log('복합결제일 경우...');
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyBoardDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      if (this.cardresult && this.cardresult.approved) {
        this.cartInitAndClose();
      } else {
        this.nicePay();
      }
    } else if (event.keyCode === KeyCode.ESCAPE) {
      this.close();
    }
  }

}
