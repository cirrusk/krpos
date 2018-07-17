import { StatusDisplay } from './../../../data/models/payment/payment.enum';
import { Component, OnInit, OnDestroy, ElementRef, ViewChildren, QueryList, HostListener } from '@angular/core';

import { ModalComponent, ModalService, SpinnerService, Logger } from '../../../core';
import { OrderService } from '../../../service';
import { KeyCode } from '../../../data';
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
  private dupcheck = false;
  @ViewChildren('codes') codes: QueryList<ElementRef>;
  constructor(protected modalService: ModalService, private order: OrderService,
    private spinner: SpinnerService, private logger: Logger) {
    super(modalService);
    this.finishStatus = null;
    this.checktype = 0;
  }

  ngOnInit() {
    this.productInfo = this.callerData.productInfo;
    if (this.productInfo) {
      if (this.productInfo.rfid && !this.productInfo.serialNumber) {
        this.regLabel = 'RFID 스캔';
        this.finishStatus = StatusDisplay.PAID;
        this.apprmessage = `${this.productInfo.name}의 ${this.regLabel} 후 진행해주세요.`;
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
    let serial: string;
    if (this.productInfo.rfid && !this.productInfo.serialNumber) {
      this.checktype = 0;
      this.result = { serial: null, rfid: 'dummy_rfid'};
      this.close();
    } else {
      this.codes.forEach(cd => {
        if (cd.nativeElement.getAttribute('type') === 'text') {
          if (Utils.isEmpty(cd.nativeElement.value)) {
            chkidx++;
            prdname = cd.nativeElement.getAttribute('data-prdname');
            pelm = cd;
            return false;
          } else {
            serial = cd.nativeElement.value;
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
        this.result = { serial: serial, rfid: null};
        this.close();
      }
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
