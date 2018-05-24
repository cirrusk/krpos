import { AlertService } from './../../../../core/alert/alert.service';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

import { ModalComponent, ModalService } from '../../../../core';
import { MessageService } from '../../../../service';

@Component({
  selector: 'pos-cash',
  templateUrl: './cash.component.html'
})
export class CashComponent extends ModalComponent  implements OnInit {

  @ViewChild('paid')    private paid: ElementRef;    // 내신금액
  @ViewChild('payment') private payment: ElementRef; // 결제금액
  finishStatus: string;                              // 결제완료 상태

  constructor(protected modalService: ModalService,
              private messageService: MessageService,
              private alert: AlertService) {
    super(modalService);
  }

  ngOnInit() {
    this.paid.nativeElement.value = 0;
    this.paid.nativeElement.focus();
    this.payment.nativeElement.value = 0;
  }

  pay(paidAmount: number, payAmount: number) {
    if (paidAmount < 1) {
      this.alert.warn({message: this.messageService.get('notinputPaid')});
    } else {
      this.finishStatus = 'ok';
    }
  }

  nextStep() {
    this.payment.nativeElement.focus();
  }

  close() {
    this.closeModal();
  }

}
