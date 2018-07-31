import { Component, OnInit, OnDestroy, ElementRef, ViewChildren, QueryList, HostListener } from '@angular/core';

import { range } from 'lodash';
import { ModalComponent, ModalService } from '../../../core';
import { KeyCode, StatusDisplay } from '../../../data';
import { Utils } from '../../../core/utils';
import { Product } from '../../../data/models/cart/cart-data';

@Component({
  selector: 'pos-serial',
  templateUrl: './serial.component.html'
})
export class SerialComponent extends ModalComponent implements OnInit, OnDestroy {
  regLabel: string;
  finishStatus: string;
  checktype: number;
  apprmessage: string;
  productInfo: Product;
  productCount = [];
  private dupcheck = false;
  private serialNumbers = [];
  private rfids = [];
  @ViewChildren('codes') codes: QueryList<ElementRef>;
  constructor(protected modalService: ModalService) {
    super(modalService);
    this.finishStatus = null;
    this.checktype = 0;
  }

  ngOnInit() {
    this.productInfo = this.callerData.productInfo;
    const psize: number = this.callerData.productQty ? this.callerData.productQty : 0;
    if (psize === 0) {
      this.productCount = range(0, 1);
    } else {
      this.productCount = range(0, psize - 1);
    }
    if (this.productInfo) {
      if (this.productInfo.rfid && !this.productInfo.serialNumber) {
        this.regLabel = 'RFID 스캔';
      } else if (this.productInfo.serialNumber && !this.productInfo.rfid) {
        this.regLabel = '시리얼 번호 입력';
      } else if (this.productInfo.serialNumber && this.productInfo.rfid) {
        this.regLabel = '시리얼 번호 입력 / RFID 스캔';
      }
    }
    setTimeout(() => { this.codes.first.nativeElement.focus(); }, 50);
  }

  ngOnDestroy() { }

  check(codes: any, evt: any) {
    evt.preventDefault();
    if (evt.srcElement.nextElementSibling) { // 다음 요소가 있음.
      evt.srcElement.nextElementSibling.focus();
    } else { // 마지막 요소임.
      evt.srcElement.blur();
    }
    let chkidx = 0;
    let prdname: string;
    const code = codes.value;
    if (Utils.isEmpty(code)) {
      chkidx++;
      prdname = codes.getAttribute('data-prdname');
    }
    const target = evt.target || evt.srcElement || evt.currentTarget;
    if (chkidx !== 0) {
      this.checktype = -1;
      this.apprmessage = `${prdname} 상품을 스캔해주세요.`;
      if (target) { setTimeout(() => { target.focus(); }, 50); }
      return;
    } else {
      this.checktype = 0;
      this.finishStatus = StatusDisplay.PAID;
      this.apprmessage = '스캔이 완료되었습니다.';
      if (target) { setTimeout(() => { target.setAttribute('readonly', 'readonly'); target.blur(); }, 50); }
    }
  }

  reg() {
    let chkidx = 0;
    let prdname: string;
    let pelm: any;
    let stype: string;
    let rtype: string;
    let serial = '';
    let rfid = '';

    this.codes.forEach(cd => {
      if (cd.nativeElement.getAttribute('type') === 'text') {
        if (Utils.isEmpty(cd.nativeElement.value)) {
          chkidx++;
          prdname = cd.nativeElement.getAttribute('data-prdname');
          pelm = cd;
          return false;
        } else {
          stype = cd.nativeElement.getAttribute('data-serial') ? cd.nativeElement.getAttribute('data-serial') : 'false';
          rtype = cd.nativeElement.getAttribute('data-rfid') ? cd.nativeElement.getAttribute('data-rfid') : 'false';
          if (stype === 'true' && rtype === 'false') {
            serial = cd.nativeElement.value;
            this.serialNumbers.push(serial);
          }
          if (stype === 'false' && rtype === 'true') {
            rfid = cd.nativeElement.value;
            this.rfids.push(rfid);
          }
        }
      }
    });
    if (chkidx !== 0) {
      this.checktype = -1;
      this.apprmessage = `${prdname} 상품을 스캔해주세요.`;
      if (pelm) { setTimeout(() => { pelm.nativeElement.focus(); }, 50); }
      return;
    } else {
      this.checktype = 0;
      this.result = { serialNumber: serial, serialNumbers: this.serialNumbers, rfid: rfid, rfids: this.rfids };
      this.close();
    }
  }

  close() {
    this.closeModal();
  }

  @HostListener('document:keydown', ['$event'])
  onSerialKeyBoardDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      if (this.finishStatus === StatusDisplay.PAID) {
        if (!this.dupcheck) {
          setTimeout(() => { this.reg(); }, 300);
          this.dupcheck = true;
        }
      }
    }
  }

}
