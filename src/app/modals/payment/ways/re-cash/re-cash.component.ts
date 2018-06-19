import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';

import { ModalComponent, ModalService } from '../../../../core';
import { KeyCode } from '../../../../data';

@Component({
  selector: 'pos-re-cash',
  templateUrl: './re-cash.component.html'
})
export class ReCashComponent extends ModalComponent implements OnInit {
  isAllPay: boolean;
  @ViewChild('usePoint') usePoint: ElementRef;
  constructor(protected modalService: ModalService) {
    super(modalService);
    this.isAllPay = false;
  }

  ngOnInit() {
    setTimeout(() => { this.usePoint.nativeElement.focus(); }, 50);
  }

  payPoint() {
    if (this.isAllPay) {
      console.log('*** use point : all point');
    } else {
      console.log('*** use point : ' + this.usePoint.nativeElement.value);
    }
    // action pay....
  }

  checkPay(type: number) {
    if (type === 0) {
      this.usePoint.nativeElement.value = '';
      this.isAllPay = true;
    } else {
      this.isAllPay = false;
      this.usePoint.nativeElement.focus();
    }
  }

  close() {
    this.closeModal();
  }

  @HostListener('document:keydown', ['$event'])
  onAlertKeyDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      this.payPoint();
    }
  }

}
