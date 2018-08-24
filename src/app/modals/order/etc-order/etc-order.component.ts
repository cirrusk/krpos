import { Component, OnInit, ViewChildren, QueryList, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SearchBerComponent } from '../../account/search-ber/search-ber.component';
import { ModalComponent, ModalService, Modal } from '../../../core';
import { Accounts, ModalIds } from '../../../data';
import { PickupOrderComponent } from '../pickup-order/pickup-order.component';

@Component({
  selector: 'pos-etc-order',
  templateUrl: './etc-order.component.html'
})
export class EtcOrderComponent extends ModalComponent implements OnInit, OnDestroy {
  // private listner: any;
  private accountInfo: Accounts;
  @ViewChildren('etcorders') etcorders: QueryList<ElementRef>;
  constructor(
    protected modalService: ModalService,
    private modal: Modal,
    private renderer: Renderer2,
    private router: Router) {
    super(modalService);
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
  }

  ngOnDestroy() {
  }

  /**
   * 사업자 등록증 조회
   *
   * @param evt
   */
  searchBER(evt: any) {
    if (!this.accountInfo) {
      return;
    }
    this.setSelected(evt);
    this.close();
    this.modal.openModalByComponent(SearchBerComponent,
      {
        callerData: { aboNum: this.accountInfo.parties[0].uid },
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        closeByClickOutside: false,
        modalId: ModalIds.BERSEARCH
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
    this.router.navigate(['/order-complete']);
    setTimeout(() => { this.close(); }, 270);
  }

  /**
   * 결제수단변경/재주문
   *
   * @param evt
   */
  changePayment(evt: any) {
    this.setSelected(evt);
    this.router.navigate(['/order-complete']);
    setTimeout(() => { this.close(); }, 270);
  }

  /**
   * 파이토카페 주문
   */
  phytoCafeOrder() {
    // this.info.sendInfo('pyt', { action: true }); // order 에 이벤트 전송 파이토 유저로 변경
    this.result = 'pyt';
    this.close();
  }

  /**
   * 대시 보드로 이동
   */
  dashboard() {
    this.router.navigate(['/dashboard']);
    setTimeout(() => { this.close(); }, 270);
  }

  /**
   * 간편 선물 팝업
   * @param evt
   */
  easyPickup(evt: any) {
    this.setSelected(evt);
    this.close();
    this.modal.openModalByComponent(PickupOrderComponent,
      {
        title: '간편 선물 리스트',
        callerData : {searchType : 'e'},
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        closeByClickOutside: false,
        modalId: ModalIds.PICKUP
      }
    );
  }

  /**
   * 설치 주문 팝업
   * @param evt
   */
  installationOrder(evt: any) {
    this.setSelected(evt);
    this.close();
    this.modal.openModalByComponent(PickupOrderComponent,
      {
        title: '설치 주문 리스트',
        callerData : {searchType : 'i'},
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        closeByClickOutside: false,
        modalId: ModalIds.INSTALL
      }
    );
  }

  close() {
    this.closeModal();
  }

  /**
   * 선택 CSS
   * @param evt
   */
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
