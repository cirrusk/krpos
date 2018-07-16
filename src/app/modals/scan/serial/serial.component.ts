import { StatusDisplay } from './../../../data/models/payment/payment.enum';
import { Component, OnInit, OnDestroy, ElementRef, ViewChildren, QueryList, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService, SpinnerService, Logger } from '../../../core';
import { OrderService } from '../../../service';
import { Order } from '../../../data/models/order/order';
import { Cart } from '../../../data/models/order/cart';
import { SerialRfid } from '../../../data/models/order/cart';
import { Accounts, ProductScanTypes, KeyCode, SerialEntries, SerialEntry } from '../../../data';
import { Utils } from '../../../core/utils';

@Component({
  selector: 'pos-serial',
  templateUrl: './serial.component.html'
})
export class SerialComponent extends ModalComponent implements OnInit, OnDestroy {
  regLabel: string;
  finishStatus: string;
  checktype: number;
  apprmessage: string;
  private dupcheck = false;
  private regType: number;
  private orderInfo: Order;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  serialRfidList: Array<SerialRfid>;
  private regsubscription: Subscription;
  @ViewChildren('codes') codes: QueryList<ElementRef>;
  constructor(protected modalService: ModalService, private order: OrderService,
    private spinner: SpinnerService, private logger: Logger) {
    super(modalService);
    this.serialRfidList = new Array<SerialRfid>();
    this.finishStatus = null;
    this.checktype = 0;
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.orderInfo = this.callerData.orderInfo;
    if (this.regType === 1) {
      this.regLabel = '시리얼 번호';
    } else if (this.regType === 2) {
      this.regLabel = 'RFID';
    } else {
      this.regLabel = '시리얼 번호/RFID';
    }
    this.cartInfo.entries.forEach(entry => {
      if (entry.product) {
        console.log('>>> product name : ' + entry.product.name);
        console.log('>>> product serial : ' + entry.product.serialNumber);
        console.log('>>> product rfid : ' + entry.product.rfid);
        console.log('>>> product entrynumber : ' + entry.entryNumber);
        if (entry.product.serialNumber || entry.product.rfid) {
          let type = '';
          let hasSerial: boolean;
          let hasRfid: boolean;
          if (entry.product.serialNumber && !entry.product.rfid) {
            type = ProductScanTypes.SERIALNUMBER;
            hasSerial = true;
            hasRfid = false;
          }
          if (!entry.product.serialNumber && entry.product.rfid) {
            type = ProductScanTypes.RFID;
            hasSerial = false;
            hasRfid = true;
          }
          if (entry.product.serialNumber && entry.product.rfid) {
            type = ProductScanTypes.SERIALNUMBER;
            hasSerial = true;
            hasRfid = true;
          }
          console.log('>>> product type : ' + type);
          this.serialRfidList.push(new SerialRfid(entry.product.name, type, hasSerial, hasRfid, entry.entryNumber));
        }
      }
    });
    this.serialRfidList.sort(
      (left: SerialRfid, right: SerialRfid): number => {
        if (left.type > right.type) {
          return -1;
        } else {
          return 1;
        }
      }
    );
    setTimeout(() => { this.codes.first.nativeElement.focus(); }, 50);

  }

  ngOnDestroy() {
    if (this.regsubscription) { this.regsubscription.unsubscribe(); }
  }

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
      if (target) { setTimeout(() => { target.blur(); }, 50); }
    }
  }

  reg() {
    let chkidx = 0;
    let prdname: string;
    let pelm: any;
    this.codes.forEach(cd => {
      if (cd.nativeElement.getAttribute('type') === 'text') {
        if (Utils.isEmpty(cd.nativeElement.value)) {
          chkidx++;
          prdname = cd.nativeElement.getAttribute('data-prdname');
          pelm = cd;
          return false;
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
    }
    this.spinner.show();
    const serialEntryArray: Array<SerialEntry> = new Array<SerialEntry>();
    let serialEntry: SerialEntry;
    this.codes.forEach(cd => {
      serialEntry = new SerialEntry();
      serialEntry.entryNumber = cd.nativeElement.getAttribute('data-entry');
      if (cd.nativeElement.getAttribute('data-type') === ProductScanTypes.RFID) {
        serialEntry.RFID = 'SCAN-' + ProductScanTypes.RFID;
      } else {
        serialEntry.SERIAL_NUMBER = cd.nativeElement.value;
      }
      serialEntryArray.push(serialEntry);
    });
    const serialEntries: SerialEntries = new SerialEntries();
    serialEntries.orderEntries = serialEntryArray;
    this.logger.set('serial.component', `Serial Entries : ${Utils.stringify(serialEntries)}`).debug();
    this.regsubscription = this.order.serialAndRfid(this.accountInfo.parties[0].uid, this.orderInfo.code, serialEntries).subscribe(
      result => {
        console.log(result);
        if (result.code === '200') {

        } else {

        }
        this.result = true;
      },
      error => { this.result = true; this.spinner.hide(); this.logger.set('serial.component', `${error}`).error(); },
      () => { this.result = true; this.spinner.hide(); this.close(); }); // 주의) close를 여러번 하면 subscribe가 여러번 발생!
  }

  close() {
    this.closeModal();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyBoardDown(event: any) {
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
