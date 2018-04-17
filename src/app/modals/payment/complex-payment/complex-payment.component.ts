import { Component, OnInit, ViewChildren, ElementRef, QueryList, Renderer2 } from '@angular/core';
import { ModalComponent } from '../../../core/modal/modal.component';
import { ModalService } from '../../../service/pos';
import { FocusBlurDirective } from '../../../core/modal/focus-blur.directive';

@Component({
  selector: 'pos-complex-payment',
  templateUrl: './complex-payment.component.html'
})
export class ComplexPaymentComponent extends ModalComponent implements OnInit {
  @ViewChildren('paytypes') paytypes: QueryList<ElementRef>;
  constructor(protected modalService: ModalService, private renderer: Renderer2) {
    super(modalService);
  }

  ngOnInit() {
  }
  private creditCard(evt: any) {
    this.setSelected(evt);
  }

  private icCard(evt: any) {
    this.setSelected(evt);
  }

  private amwayPoint(evt: any) {
    this.setSelected(evt);
  }

  private memberPoint(evt: any) {
    this.setSelected(evt);
  }

  private cashPayment(evt: any) {
    this.setSelected(evt);
  }

  private directDebitPayment(evt: any) {
    this.setSelected(evt);
  }

  private checkPayment(evt: any) {
    this.setSelected(evt);
  }

  private reCashPayment(evt: any) {
    this.setSelected(evt);
  }

  private couponPayment(evt: any) {
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
