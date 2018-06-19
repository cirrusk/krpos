import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';

import { ModalComponent, ModalService } from '../../../../core';
import { KeyCode } from '../../../../data';

@Component({
  selector: 'pos-point',
  templateUrl: './point.component.html'
})
export class PointComponent extends ModalComponent implements OnInit {

  pointType: string; // modal component 호출 시 전달 받은 포인트 타입
  pointTypeText: string;
  isAllPay: boolean;
  @ViewChild('usePoint') usePoint: ElementRef;
  constructor(protected modalService: ModalService) {
    super(modalService);
    this.isAllPay = true;
  }

  ngOnInit() {
    console.log('----> ' + this.pointType);
    if (this.pointType === 'a') {
      this.pointTypeText = 'A포인트';
    } else {
      this.pointTypeText = 'Member 포인트';
    }
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
      this.isAllPay = true;
    } else {
      this.isAllPay = false;
      this.usePoint.nativeElement.value = '';
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
