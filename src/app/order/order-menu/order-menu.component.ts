import { Component, OnInit, Renderer2, ElementRef, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { Modal, StorageService, Logger } from '../../core';
import { PromotionOrderComponent, EtcOrderComponent,
  SearchAccountComponent, PickupOrderComponent, NormalPaymentComponent,
  ComplexPaymentComponent, CancelOrderComponent } from '../../modals';

@Component({
  selector: 'pos-order-menu',
  templateUrl: './order-menu.component.html'
})
export class OrderMenuComponent implements OnInit, OnDestroy {
  promotionItems = [];
  hasAccount = false;
  hasProduct = false;
  @ViewChildren('menus') menus: QueryList<ElementRef>;
  constructor(private modal: Modal, private storage: StorageService,
    private logger: Logger, private element: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    this.addPromotions();
  }

  ngOnDestroy() {
  }

  /**
   * cart list 에서 보내준 이벤트를 받음
   * 
   * @param data 보내준 데이터
   */
  setFlag(data) {
    if (data) {
      this.logger.set('order.menu.component', `from cart list to cart menu flag receive, type : ${data.type}`).debug();
      if (data.type === 'account') {
        this.hasAccount = data.flag;
      } else if (data.type === 'product') {
        this.hasProduct = data.flag;
      }
    }
  }

  /**
   * 프로모션은 최대 8개까지
   */
  private addPromotions() {
    this.promotionItems.push({ title: 'Promotion 1', img: '140x187_01.jpg' });
    this.promotionItems.push({ title: 'Promotion 2', img: '140x187_02.jpg' });
    this.promotionItems.push({ title: 'Promotion 3', img: '140x187_03.jpg' });
    this.promotionItems.push({ title: 'Promotion 4', img: '140x187_04.jpg' });
    this.promotionItems.push({ title: 'Promotion 5', img: '140x187_05.jpg' });
    this.promotionItems.push({ title: 'Promotion 6', img: '140x187_06.jpg' });
    this.promotionItems.push({ title: 'Promotion 7', img: '140x187_07.jpg' });
    this.promotionItems.push({ title: 'Promotion 8', img: '140x187_08.jpg' });
  }

  /**
   * 일반 결제 팝업
   *
   * @param evt
   */
  normalPayment(evt: any) {
    if (!this.hasAccount || !this.hasProduct) { return; }
    this.checkClass(evt);
    this.modal.openModalByComponent(NormalPaymentComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        modalId: 'NormalPaymentComponent'
      }
    );
  }

  /**
   * 복합 결제 팝업
   * @param evt
   */
  complexPayment(evt: any) {
    if (!this.hasAccount || !this.hasProduct) { return; }
    this.checkClass(evt);
    this.modal.openModalByComponent(ComplexPaymentComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        modalId: 'ComplexPaymentComponent'
      }
    );
  }

  /**
   * 그룹 결제 사용자 검색 팝업
   * parameter 로 paymentType 을 넘겨서 그룹 결제일 경우 활용하도록 함.
   * paymentType = 'g' 그룹 결제
   * paymentType = 'n' 일반 결제
   *
   * @param evt
   */
  groupPayment(evt: any) {
    this.checkClass(evt);
    this.modal.openModalByComponent(SearchAccountComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        paymentType: 'g',
        modalId: 'SearchAccountComponent'
      }
    );
  }

  /**
   * 픽업 오더 팝업
   *
   * @param evt
   */
  pickupOrder(evt: any) {
    if (!this.hasAccount) { return; }
    this.checkClass(evt);
    this.modal.openModalByComponent(PickupOrderComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: true,
        modalId: 'PickupOrderComponent'
      }
    );
  }

  /**
   * 구매 취소
   *
   * @param evt
   */
  cancelOrder(evt: any) {
    if (!this.hasAccount || !this.hasProduct) { return; }
    // this.checkClass(evt);
    this.modal.openModalByComponent(CancelOrderComponent,
      {
        title: '',
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        closeByClickOutside: true,
        modalId: 'CancelOrderComponent'
      }
    );
  }

  /**
   * 프로모션
   *
   * @param evt
   */
  promotionOrder(evt: any) {
    if (!this.hasAccount) { return; }
    // this.checkPromotionClass(evt);
    this.modal.openModalByComponent(PromotionOrderComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        modalId: 'PromotionOrderComponent'
      }
    );
  }

  /**
   * 기타
   *
   * @param evt
   */
  etcOrder(evt: any) {
    if (!this.hasAccount || !this.hasProduct) { return; }
    // this.checkClass(evt);
    this.modal.openModalByComponent(EtcOrderComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        modalId: 'EtcOrderComponent'
      }
    );
  }

  private checkClass(evt: any) {
    evt.stopPropagation();
    this.menus.forEach(menu => {
      // this.renderer.removeClass(menu.nativeElement, 'blue');
      this.renderer.removeClass(menu.nativeElement, 'on');
    });
    // this.renderer.addClass(evt.target, 'blue');
    this.renderer.addClass(evt.target, 'on');
  }

  private checkPromotionClass(evt: any) {
    evt.stopPropagation();
    this.menus.forEach(menu => {
      // this.renderer.removeClass(menu.nativeElement, 'blue');
      this.renderer.removeClass(menu.nativeElement, 'on');
    });
    this.renderer.addClass(evt.target, 'on');
  }

}
