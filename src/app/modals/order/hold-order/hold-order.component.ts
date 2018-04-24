import { Modal } from './../../../core/modal/modal';
import { Component, OnInit } from '@angular/core';

import { ModalComponent } from '../../../core/modal/modal.component';
import { ModalService, Logger } from '../../../service/pos';
import { CartService } from '../../../service/order/cart.service';
import Utils from '../../../core/utils';
import { AlertType } from '../../../core/alert/alert-type.enum';
import { SpinnerService } from '../../../core/spinner/spinner.service';
import { AlertService } from '../../../core/alert/alert.service';
import { PagerService } from '../../../service/common/pager.service';
import { RestoreCartBroker } from '../../../broker/order/cart/restore-cart.broker';
import { Cart } from '../../../data/models/order/cart';

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
              private logger: Logger) {
    super(modalService);
    this.cartList = new Array<Cart>();
    this.activeNum = -1;
    this.getCarts();
  }

  ngOnInit() {
  }

  // 테이블 로우 Class 적용(on)
  activeRow(index: number): void {
    this.activeNum = index;
    this.restoreCartBroker.sendInfo(this.currentCartList[index]);
    this.close();
  }

  /**
   * 보류된 장바구니 리스트 가져오기
   */
  getCarts() {
    this.spinner.show();
    this.cartService.getCarts().subscribe(
      result => {
        this.cartList = result.carts;
        this.setPage(Math.ceil(this.cartList.length / 5), 5);
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('holdOrder.component', `Get Carts error type : ${errdata.type}`).error();
          this.logger.set('holdOrder.component', `Get Carts error message : ${errdata.message}`).error();
          this.alert.show({ alertType: AlertType.error, title: '오류', message: `${errdata.message}` });
        }
      },
      () => { this.spinner.hide(); }
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
