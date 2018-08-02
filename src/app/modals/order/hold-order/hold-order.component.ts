import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService, Modal, Logger, SpinnerService, AlertService, AlertType } from '../../../core';

import { CartService, PagerService } from '../../../service';
import { RestoreCartBroker, InfoBroker } from '../../../broker';
import { Cart } from '../../../data/models/order/cart';
import { Utils } from '../../../core/utils';


import { Pagination } from '../../../data';

@Component({
  selector: 'pos-hold-order',
  templateUrl: './hold-order.component.html'
})
export class HoldOrderComponent extends ModalComponent  implements OnInit, OnDestroy {
  private PAGE_SIZE = 5;

  private currentPage: number;                    // 현재 페이지 번호
  private pager: Pagination;                      // pagination 정보
  private selectedCartNum: number;                // 선택된 카트번호

  cartList: Array<Cart>;
  currentCartList: Array<Cart>;
  activeNum: number;

  private holdsubscription: Subscription;

  constructor(modalService: ModalService,
              private cartService: CartService,
              private spinner: SpinnerService,
              private alert: AlertService,
              private pagerService: PagerService,
              private restoreCartBroker: RestoreCartBroker,
              private info: InfoBroker,
              private logger: Logger) {
    super(modalService);
    this.cartList = new Array<Cart>();
    this.activeNum = -1;
    this.pager = new Pagination();
  }

  ngOnInit() {
    this.getSaveCarts(this.callerData ? this.callerData.userId : '');
  }

  ngOnDestroy() {
    if (this.holdsubscription) { this.holdsubscription.unsubscribe(); }
  }

  /**
   * 선택 row 활성화
   * @param index
   */
  activeRow(index: number): void {
    this.activeNum = index;
    this.restoreCartBroker.sendInfo(this.currentCartList[index]);
    this.info.sendInfo('hold', 'add');
    this.close();
  }

  /**
   * 보류된 장바구니 리스트 가져오기
   * @param {string} userId 유저아이디
   */
  getSaveCarts(userId?: string) {
    this.spinner.show();
    this.holdsubscription = this.cartService.getSaveCarts(userId).subscribe(
      result => {
        this.cartList = result.carts;
        this.setPage(Math.ceil(this.cartList.length / 5));
      },
      error => {
        this.spinner.hide();
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('holdOrder.component', `Get Carts error type : ${errdata.type}`).error();
          this.logger.set('holdOrder.component', `Get Carts error message : ${errdata.message}`).error();
          this.alert.error({ message: `${errdata.message}` });
        }
      },
      () => { this.spinner.hide(); }
    );
  }

  /**
   * 출력 데이터 생성
   * @param {number} page 페이지 번호
   * @param {boolean} 페이지 이동
   */
  setPage(page: number, pagerFlag: boolean = false) {
    if ((page < 1 || page > this.pager.totalPages) && pagerFlag) {
      return;
    }

    const currentData = this.pagerService.getCurrentPage(this.cartList, page, this.PAGE_SIZE);
    // pagination 생성 데이터 조회
    this.pager = Object.assign(currentData.get('pager'));
    // 출력 리스트 생성
    this.currentCartList = Object.assign(currentData.get('list'));
  }

  close() {
    this.closeModal();
  }

}
