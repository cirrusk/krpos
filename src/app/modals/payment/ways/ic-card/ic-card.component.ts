import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

import { CompletePaymentComponent } from '../../complete-payment/complete-payment.component';
import { ReceiptService, MessageService, PaymentService } from '../../../../service';
import {
  ModalComponent, ModalService, NicePaymentService, Logger,
  StorageService, Modal, ICCardApprovalResult, NiceConstants, SpinnerService
} from '../../../../core';
import {
  KeyCode, PaymentCapture, Accounts, StatusDisplay, AmwayExtendedOrdering, ModalIds
} from '../../../../data';
import { Order } from '../../../../data/models/order/order';
import { Cart } from '../../../../data/models/order/cart';
import { InfoBroker } from '../../../../broker';
import { Utils } from '../../../../core/utils';

@Component({
  selector: 'pos-ic-card',
  templateUrl: './ic-card.component.html'
})
export class IcCardComponent extends ModalComponent implements OnInit, OnDestroy {
  paidamount: number;
  finishStatus: string;                                // 결제완료 상태
  paidDate: Date;
  cardnumber: string; // 카드번호
  cardcompany: string; // 카드사명
  cardauthnumber: string; // 승인번호
  checktype: number;
  apprmessage: string;
  private orderInfo: Order;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private amwayExtendedOrdering: AmwayExtendedOrdering;
  private paymentcapture: PaymentCapture;
  private cardresult: ICCardApprovalResult;
  private paymentsubscription: Subscription;
  private dupcheck = false;
  constructor(protected modalService: ModalService, private modal: Modal, private receipt: ReceiptService,
    private message: MessageService, private nicepay: NicePaymentService, private payment: PaymentService,
    private storage: StorageService, private spinner: SpinnerService, private info: InfoBroker, private logger: Logger) {
    super(modalService);
    this.finishStatus = null;
    this.checktype = 0;
  }

  ngOnInit() {
    this.storage.removePay(); // 단독결재만 하므로 초기화
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.amwayExtendedOrdering = this.callerData.amwayExtendedOrdering;
    this.loadPayment();
  }

  ngOnDestroy() {
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    this.receipt.dispose();
  }

  private loadPayment() {
    this.paidamount = this.cartInfo.totalPrice.value;
    const p: PaymentCapture = this.paymentcapture || this.storage.getPaymentCapture();
    if (p && p.icCardPaymentInfo) {
      this.cardnumber = p.icCardPaymentInfo.cardNumber;
      this.cardcompany = p.icCardPaymentInfo.paymentInfoLine1 ? p.icCardPaymentInfo.paymentInfoLine1 : '';
      this.cardauthnumber = p.icCardPaymentInfo.cardAuthNumber;
      this.paidDate = Utils.convertDate(p.icCardPaymentInfo.cardRequestDate);
    } else {
      if (this.storage.getPay() > 0) {
        this.paidamount = this.storage.getPay();
      }
    }
  }

  /**
   * 현금 IC카드는 단독결제임.
   */
  private nicePay() {
    this.cardPay();
  }

  /**
   * 카드결제만 진행
   */
  private cardPay() {
    this.spinner.show();
    const resultNotifier: Subject<ICCardApprovalResult> = this.nicepay.icCardApproval(String(this.paidamount));
    this.logger.set('ic.card.component', 'listening on reading ic card...').debug();
    resultNotifier.subscribe(
      (res: ICCardApprovalResult) => {
        this.cardresult = res;
        if (res.code !== NiceConstants.ERROR_CODE.NORMAL) {
          this.finishStatus = 'retry';
          this.apprmessage = res.msg;
          this.dupcheck = false;
          this.spinner.hide();
        } else {
          if (res.approved) {
            this.checktype = 0;
            this.finishStatus = StatusDisplay.PAID;
            this.cardnumber = res.maskedCardNumber;
            this.cardcompany = res.issuerName;
            this.cardauthnumber = res.approvalNumber;
            this.paidDate = Utils.convertDate(res.approvalDateTime);
            this.paymentcapture = this.payment.makeICPaymentCaptureData(this.paymentcapture, this.cardresult, this.paidamount).capturePaymentInfoData;
            this.result = this.paymentcapture;
            this.apprmessage = this.message.get('card.payment.success'); // '카드결제 승인이 완료되었습니다.';
            this.payment.sendPaymentAndOrderInfo(this.paymentcapture, null);
            this.logger.set('ic.card.component', 'ic card payment : ' + Utils.stringify(this.paymentcapture)).debug();
          } else {
            this.finishStatus = 'fail';
            this.apprmessage = res.resultMsg1 + ' ' + res.resultMsg2;
          }
          this.spinner.hide();
        }
      },
      error => {
        this.spinner.hide();
        this.logger.set('ic.card.component', `${error}`).error();
        this.storage.removePaymentModeCode();
      },
      () => { this.spinner.hide(); });
  }

  close() {
    this.closeModal();
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

  private payFinishByEnter() {
    if (Utils.isPaymentSuccess(this.finishStatus)) {
      this.completePayPopup(this.paidamount, this.paidamount, 0);
    } else if (this.finishStatus === 'recart') {
      this.info.sendInfo('recart', this.orderInfo);
      this.info.sendInfo('orderClear', 'clear');
      this.close();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onIcCardDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      const modalid = this.storage.getLatestModalId();
      if (modalid !== ModalIds.COMPLETE) {
        this.doPay();
      }
    } else if (event.KeyCode === KeyCode.ESCAPE) {
      this.spinner.hide();
    }
  }

  private doPay() {
    if (this.cardresult && this.cardresult.code !== NiceConstants.ERROR_CODE.NORMAL) { // 카드 결제 시 오류로 재결제 필요
      if (!this.dupcheck) {
        setTimeout(() => { this.nicePay(); }, 300);
        this.dupcheck = true;
      }
    } else {
      if (this.cardresult && this.cardresult.approved) { // 카드 승인 결과 있고 성공
        this.payFinishByEnter();
      } else if (this.cardresult && !this.cardresult.approved) { // 카드 승인 결과 있고 실패
        this.close();
      } else {
        if (!this.dupcheck) {
          setTimeout(() => { this.nicePay(); }, 300);
          this.dupcheck = true;
        }
      }
    }
  }
}
