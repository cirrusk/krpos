import { Component, OnInit } from '@angular/core';

import { ModalComponent, ModalService, Modal, Logger, SpinnerService, AlertService, AlertType } from '../../../core';

import { CartService, PagerService } from '../../../service';
import { RestoreCartBroker } from '../../../broker';
import { Cart } from '../../../data/models/order/cart';
import Utils from '../../../core/utils';

import { InfoBroker } from '../../../broker/info.broker';

@Component({
  selector: 'pos-hold-order',
  templateUrl: './hold-order.component.html'
})
export class HoldOrderComponent extends ModalComponent  implements OnInit {

  private currentPage: number;                    // 현재 페이지 번호
  private pager: any = {};                        // pagination 정보
  private selectedCartNum: number;                // 선택된 카트번호

  cartList: Array<Cart>;
  currentCartList: Array<Cart>;
  activeNum: number;

  constructor(modalService: ModalService,
              private cartService: CartService,
              private spinner: SpinnerService,
              private alert: AlertService,
              private pagerService: PagerService,
              private restoreCartBroker: RestoreCartBroker,
              private infoBroker: InfoBroker,
              private logger: Logger) {
    super(modalService);
    this.cartList = new Array<Cart>();
    this.activeNum = -1;
  }

  ngOnInit() {
    this.getCarts(this.callerData ? this.callerData.userId : '');
  }

  // 테이블 로우 Class 적용(on)
  activeRow(index: number): void {
    this.activeNum = index;
    this.restoreCartBroker.sendInfo(this.currentCartList[index]);
    this.infoBroker.sendInfo('hold', 'add');
    this.close();
  }

  /**
   * 보류된 장바구니 리스트 가져오기
   */
  getCarts(userId?: string) {
    // this.spinner.show();
    this.cartService.getCarts(userId).subscribe(
      result => {
        this.cartList = result.carts;
        this.setPage(Math.ceil(this.cartList.length / 5), 5);
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('holdOrder.component', `Get Carts error type : ${errdata.type}`).error();
          this.logger.set('holdOrder.component', `Get Carts error message : ${errdata.message}`).error();
          this.alert.error({ message: `${errdata.message}` });
        }
      },
      () => { // this.spinner.hide();
       }
    );
  }

  /**
   * 출력 데이터 생성
   */
  setPage(page: number, pageSize: number, pagerFlag: boolean = false) {
    if ((page < 1 || page > this.pager.totalPages) && pagerFlag) {
      return;
    }

    // pagination 생성 데이터 조회
    this.pager = this.pagerService.getPager(this.cartList.length, page);
    // 출력 리스트 생성
    this.currentCartList = this.cartList.slice(this.pager.startIndex, this.pager.endIndex + 1);
  }

  close() {
    this.closeModal();
  }

}
