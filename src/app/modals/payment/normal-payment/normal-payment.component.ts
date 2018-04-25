import { Component, OnInit, ViewChildren, ElementRef, QueryList, Renderer2 } from '@angular/core';
import { ModalComponent, ModalService, Modal } from '../../../core';

import { CreditCardComponent } from '../ways/credit-card/credit-card.component';
import { IcCardComponent } from '../ways/ic-card/ic-card.component';
import { CashComponent } from '../ways/cash/cash.component';
import { DirectDebitComponent } from '../ways/direct-debit/direct-debit.component';
import { ChecksComponent } from '../ways/checks/checks.component';
import { ReCashComponent } from '../ways/re-cash/re-cash.component';
import { CouponComponent } from '../ways/coupon/coupon.component';
import { PointComponent } from '../ways/point/point.component';

@Component({
  selector: 'pos-normal-payment',
  templateUrl: './normal-payment.component.html'
})
export class NormalPaymentComponent extends ModalComponent implements OnInit {
  @ViewChildren('paytypes') paytypes: QueryList<ElementRef>;
  constructor(protected modalService: ModalService, private modal: Modal , private renderer: Renderer2) {
    super(modalService);
  }

  ngOnInit() {
  }

  creditCard(evt: any) {
    // this.modal.clearAllModals(this.modal.getModalArray()[0]); // 앞서 열려있던 창 닫기
    this.setSelected(evt);
    this.modal.openModalByComponent(CreditCardComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        modalId: 'CreditCardComponent'
      }
    );
  }

  icCard(evt: any) {
    this.setSelected(evt);
    this.modal.openModalByComponent(IcCardComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        modalId: 'IcCardComponent'
      }
    );
  }

  amwayPoint(evt: any) {
    this.setSelected(evt);
    this.modal.openModalByComponent(PointComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        modalId: 'IcCardComponent_Amway',
        pointType: 'a'
      }
    );
  }

  memberPoint(evt: any) {
    this.setSelected(evt);
    this.modal.openModalByComponent(PointComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        modalId: 'IcCardComponent_Member',
        pointType: 'm'
      }
    );
  }

  cashPayment(evt: any) {
    this.setSelected(evt);
    this.modal.openModalByComponent(CashComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        modalId: 'CashComponent'
      }
    );
  }

  directDebitPayment(evt: any) {
    this.setSelected(evt);
    this.modal.openModalByComponent(DirectDebitComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        modalId: 'DirectDebitComponent'
      }
    );
  }

  checkPayment(evt: any) {
    this.setSelected(evt);
    this.modal.openModalByComponent(ChecksComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        modalId: 'ChecksComponent'
      }
    );
  }

  reCashPayment(evt: any) {
    this.setSelected(evt);
    this.modal.openModalByComponent(ReCashComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        modalId: 'ReCashComponent'
      }
    );
  }

  couponPayment(evt: any) {
    this.setSelected(evt);
    this.modal.openModalByComponent(CouponComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        modalId: 'CouponComponent'
      }
    );
  }

  close() {
    this.closeModal();
  }

  private setSelected(evt: any) {
    evt.stopPropagation();
    this.paytypes.forEach(paytype => {
      parent = this.renderer.parentNode(paytype.nativeElement);
      this.renderer.removeClass(parent, 'on');
      this.renderer.removeClass(paytype.nativeElement, 'on');
    });
    parent = this.renderer.parentNode(evt.target);
    this.renderer.addClass(parent, 'on');
    this.renderer.addClass(evt.target, 'on');
  }
}
