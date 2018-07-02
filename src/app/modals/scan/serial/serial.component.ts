import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService } from '../../../core';
import { OrderService } from '../../../service';
import { Order } from '../../../data/models/order/order';
import { Cart } from '../../../data/models/order/cart';
import { Accounts, ProductScanTypes } from '../../../data';
import { Utils } from '../../../core/utils';

@Component({
  selector: 'pos-serial',
  templateUrl: './serial.component.html'
})
export class SerialComponent extends ModalComponent implements OnInit, OnDestroy {
  regLabel: string;
  private regType: number;
  private orderInfo: Order;
  private cartInfo: Cart;
  private entryNumber: number;
  private accountInfo: Accounts;
  private regsubscription: Subscription;
  @ViewChild('code') private code: ElementRef;
  constructor(protected modalService: ModalService, private order: OrderService) {
    super(modalService);
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.orderInfo = this.callerData.orderInfo;
    this.entryNumber = this.callerData.entryNumber;
    if (this.regType === 1) {
      this.regLabel = '시리얼 번호';
    } else if (this.regType === 2) {
      this.regLabel = 'RFID';
    }
    setTimeout(() => { this.code.nativeElement.focus(); }, 50);
  }

  ngOnDestroy() {
    if (this.regsubscription) { this.regsubscription.unsubscribe(); }
  }

  reg() {
    const code = this.code.nativeElement.value;
    if (Utils.isEmpty(code)) {
      return;
    }
    let codeType = '';
    if (this.regType === 1) {
      codeType = ProductScanTypes.SERIALNUMBER;
    } else if (this.regType === 2) {
      codeType = ProductScanTypes.RFID;
    }

    this.regsubscription = this.order.serialAndReif(this.accountInfo.parties[0].uid, this.orderInfo.code, this.entryNumber, codeType, code).subscribe(
      result => {
        this.result = true;
        this.close();
      },
      error => { },
      () => { });
  }

  close() {
    this.closeModal();
  }

}
