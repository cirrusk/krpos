import { Component, OnInit, ViewChildren, ElementRef, QueryList, Renderer2 } from '@angular/core';
import { ModalComponent, ModalService } from '../../../core';
import { OrderEntry, Accounts } from '../../../data';

@Component({
  selector: 'pos-complex-payment',
  templateUrl: './complex-payment.component.html'
})
export class ComplexPaymentComponent extends ModalComponent implements OnInit {
  @ViewChildren('paytypes') paytypes: QueryList<ElementRef>;

  private accountInfo: Accounts;
  private cartList: Array<OrderEntry>;
  constructor(protected modalService: ModalService, private renderer: Renderer2) {
    super(modalService);
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartList = this.callerData.cartList;
  }

  creditCard(evt: any) {
    this.setSelected(evt);
  }

  icCard(evt: any) {
    this.setSelected(evt);
  }

  amwayPoint(evt: any) {
    this.setSelected(evt);
  }

  memberPoint(evt: any) {
    this.setSelected(evt);
  }

  cashPayment(evt: any) {
    this.setSelected(evt);
  }

  directDebitPayment(evt: any) {
    this.setSelected(evt);
  }

  checkPayment(evt: any) {
    this.setSelected(evt);
  }

  reCashPayment(evt: any) {
    this.setSelected(evt);
  }

  couponPayment(evt: any) {
    this.setSelected(evt);
  }

  close() {
    this.closeModal();
  }

  private setSelected(evt: any) {
    evt.stopPropagation();
    const chk = evt.target.classList.contains('on');
    const parent = this.renderer.parentNode(evt.target);
    if (chk) {
      this.renderer.removeClass(parent, 'on');
      this.renderer.removeClass(evt.target, 'on');
    } else {
      this.renderer.addClass(parent, 'on');
      this.renderer.addClass(evt.target, 'on');
    }
  }
}
