import { Component, OnInit, ElementRef, ViewChild, Renderer2, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AlertService } from '../../../../core/alert/alert.service';
import { ModalComponent, ModalService, KeyCommand, KeyboardService, Logger, Modal } from '../../../../core';
import { MessageService } from '../../../../service';
import { Accounts } from '../../../../data';
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
  private accountInfo: Accounts;
  private paymentType: string;
  paidDate: Date;
  private keyboardsubscription: Subscription;
  constructor(protected modalService: ModalService,
    private message: MessageService,
    private modal: Modal,
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
    this.accountInfo = this.callerData.account;
    this.cartInfo = this.callerData.cartInfo;
    setTimeout(() => {
      this.paid.nativeElement.value = 0;
      this.paid.nativeElement.select();
      this.paid.nativeElement.focus();
    }, 50);

    if (this.paymentType === 'n') {
      this.payment.nativeElement.value = this.cartInfo.totalPrice.value;
      setTimeout(() => { this.renderer.setAttribute(this.payment.nativeElement, 'readonly', 'readonly'); }, 5);
    } else {
      this.payment.nativeElement.value = 0;
    }

  }

  ngOnDestroy() {
    if (this.keyboardsubscription) { this.keyboardsubscription.unsubscribe(); }
  }

  pay(paidAmount: number, payAmount: number) {
    if (paidAmount < 1) {
      this.alert.warn({ message: this.message.get('notinputPaid') });
    } else {
      if (this.paymentType === 'n') {
        // payment capture 실행
        // 현금 결제 완료 후, POS는 자동으로 cash drawer 오픈
        this.paidDate = new Date();
        this.finishStatus = 'ok';
      } else {
      }
    }
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
  popupCashReceipt() {
    this.modal.openModalByComponent(CashReceiptComponent,
      {
        callerData: { account: this.accountInfo, cartInfo: this.cartInfo },
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
