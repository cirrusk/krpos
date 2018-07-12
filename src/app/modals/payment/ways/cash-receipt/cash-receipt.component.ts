import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalComponent, ModalService } from '../../../../core';
import { Utils } from '../../../../core/utils';

@Component({
  selector: 'pos-cash-receipt',
  templateUrl: './cash-receipt.component.html'
})
export class CashReceiptComponent extends ModalComponent implements OnInit {

  @ViewChild('clientnum') private clientnum: ElementRef;       // 고객번호
  private divcheck: string;
  checktype: number;
  apprmessage: string;
  fininshStatus: string;
  constructor(protected modalService: ModalService) {
    super(modalService);
    this.divcheck = 'i';
    this.checktype = 0;
    this.fininshStatus = null;
  }

  ngOnInit() {
    setTimeout(() => { this.clientnum.nativeElement.focus(); }, 50);
  }

  requestReceipt(val: string) {
    console.log('발행구분 : ' + this.divcheck);
    console.log(val);
    if (Utils.isEmpty(val)) {

    } else {

    }
  }

  selectDiv(div: string) {
    this.divcheck = div;
  }

  close() {
    this.closeModal();
  }
}
