import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalComponent, ModalService } from '../../../../core';

@Component({
  selector: 'pos-cash-receipt',
  templateUrl: './cash-receipt.component.html'
})
export class CashReceiptComponent extends ModalComponent implements OnInit {

  @ViewChild('clientnum') private clientnum: ElementRef;       // 고객번호
  private divcheck: string;
  constructor(protected modalService: ModalService) {
    super(modalService);
    this.divcheck = 'i';
  }

  ngOnInit() {
  }

  requestReceipt() {
    console.log('발행구분 : ' + this.divcheck);
    console.log(this.clientnum.nativeElement.value);
  }

  selectDiv(div: string) {
    this.divcheck = div;
  }

  close() {
    this.closeModal();
  }
}
