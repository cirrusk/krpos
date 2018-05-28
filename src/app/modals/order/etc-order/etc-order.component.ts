
import { Component, OnInit, ViewChildren, QueryList, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SearchBerComponent } from './../../account/search-ber/search-ber.component';

import { ModalComponent, ModalService, Modal } from '../../../core';
import { Accounts } from '../../../data';

@Component({
  selector: 'pos-etc-order',
  templateUrl: './etc-order.component.html'
})
export class EtcOrderComponent extends ModalComponent implements OnInit, OnDestroy {
  // private listner: any;
  private accounts: Accounts;
  @ViewChildren('etcorders') etcorders: QueryList<ElementRef>;
  constructor(
    protected modalService: ModalService,
    private modal: Modal,
    private renderer: Renderer2,
    private router: Router) {
    super(modalService);
  }

  ngOnInit() {
    // this.listner = this.renderer.listen('window', 'keydown.esc', event => {
    //   this.close();
    // });

    this.accounts = this.callerData.account;

  }

  ngOnDestroy() {
    // this.listner();
  }

  /**
   * 사업자 등록증 조회
   *
   * @param evt
   */
  searchBER(evt: any) {
    this.setSelected(evt);
    this.close();
    this.modal.openModalByComponent(SearchBerComponent,
      {
        callerData: {aboNum: this.accounts.uid},
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        closeByClickOutside: false,
        modalId: 'SearchBerComponent'
      }
    );
  }

  /**
   * 주문 완료 내역
   *
   * @param evt
   */
  completeList(evt: any) {
    this.setSelected(evt);
    this.router.navigate(['/order-complete']);
    setTimeout(() => { this.close(); }, 270);
  }

  /**
   * 영수증 재발행
   *
   * @param evt
   */
  receiptPrint(evt: any) {
    this.setSelected(evt);
  }

  /**
   * 결제수단변경/재주문
   *
   * @param evt
   */
  changePayment(evt: any) {
    this.setSelected(evt);
  }


  close() {
    this.closeModal();
  }

  private setSelected(evt: any) {
    evt.stopPropagation();
    this.etcorders.forEach(etcorder => {
      parent = this.renderer.parentNode(etcorder.nativeElement);
      this.renderer.removeClass(parent, 'on');
      this.renderer.removeClass(etcorder.nativeElement, 'on');
    });
    parent = this.renderer.parentNode(evt.target);
    this.renderer.addClass(parent, 'on');
    this.renderer.addClass(evt.target, 'on');
  }

}
