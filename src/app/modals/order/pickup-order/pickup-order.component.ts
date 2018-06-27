import { Component, OnInit, ViewChildren, QueryList, ElementRef, Renderer2, ViewChild } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { EcpPrintComponent } from '../ecp-print/ecp-print.component';
import { EcpConfirmComponent } from '../ecp-confirm/ecp-confirm.component';
import { ModalComponent, ModalService, Modal, SpinnerService, Logger, AlertService, StorageService } from '../../../core';
import { StringBuilder, Utils } from '../../../core/utils';
import { OrderHistoryList, OrderHistory } from '../../../data';
import { OrderService, MessageService, ReceiptService } from '../../../service';
import { Order } from '../../../data/models/order/order';

@Component({
  selector: 'pos-pickup-order',
  templateUrl: './pickup-order.component.html'
})
export class PickupOrderComponent extends ModalComponent implements OnInit {

  private orderListSubscription: Subscription;

  @ViewChildren('ecporders') ecporders: QueryList<ElementRef>;
  @ViewChild('inputSearchText') searchValue: ElementRef;
  sourceOrderHistoryList: OrderHistoryList;
  targetOrderHistoryList: OrderHistoryList;
  private order: Order;
  orderType: string;
  private orderTypeName: string;
  private confirmFlag = false;
  private selectedOrderNum = -1;

  searchType: string;

  constructor(protected modalService: ModalService,
              private orderService: OrderService,
              private modal: Modal,
              private spinner: SpinnerService,
              private storageService: StorageService,
              private messageService: MessageService,
              private receiptService: ReceiptService,
              private logger: Logger,
              private alert: AlertService,
              private renderer: Renderer2) {
    super(modalService);
    this.init();
  }

  init() {
    this.sourceOrderHistoryList = new OrderHistoryList(new Array<OrderHistory>());
    this.targetOrderHistoryList = new OrderHistoryList(new Array<OrderHistory>());
  }

  ngOnInit() {
    setTimeout(() => { this.searchValue.nativeElement.focus(); }, 100); // 모달 팝업 포커스 보다 timeout을 더주어야 focus 잃지 않음.
    this.orderType = this.callerData.searchType;

    if (this.orderType === 'e') {
      this.orderTypeName = '간편선물';
    } else if (this.orderType === 'i') {
      this.orderTypeName = '설치주문';
    } else {
      this.orderTypeName = '픽업예약주문';
      // this.confirmFlag = true;
    }
  }

  /**
   * 컨펌 리스트로 이동
   * @param orderCode
   */
  moveOrder(orderCode: string): void {
    let targetExistedIdx = -1;
    if (this.targetOrderHistoryList.orders) {
      targetExistedIdx = this.targetOrderHistoryList.orders.findIndex(
        function (obj) {
          return obj.code === orderCode;
        }
      );
    } else {
      targetExistedIdx = -1;
    }

    if (targetExistedIdx === -1) {
      const sourceExistedIdx: number = this.sourceOrderHistoryList.orders.findIndex(
        function (obj) {
          return obj.code === orderCode;
        }
      );

      this.targetOrderHistoryList.orders.push(this.sourceOrderHistoryList.orders[sourceExistedIdx]);
    }
  }

  /**
   * 컨펌 리스트에서 제거
   * @param orderCode
   */
  deleteOrder(orderCode: string): void {
    const existedIdx: number = this.targetOrderHistoryList.orders.findIndex(
      function (obj) {
        return obj.code === orderCode;
      }
    );

    this.targetOrderHistoryList.orders.splice(existedIdx, 1);
  }

  /**
   * 조회
   * @param searchType
   * @param searchText
   */
  searchOrder(searchType: string, searchText: string) {
    if (searchText === '' || searchText === undefined || searchText === null) {
      this.alert.info({ message: this.messageService.get('noSearchText') });
    } else {
      this.getOrderList(searchType, 'A', searchText, 0);
    }
  }

  /**
   * 주문 조회
   * @param searchType
   * @param memberType
   * @param searchText
   * @param page
   */
  getOrderList(searchType: string, memberType: string, searchText: string, page = 0) {
    this.spinner.show();
    this.orderListSubscription = this.orderService.orderList(searchText, memberType,
                                                             searchType, 'NORMAL_ORDER', 'pos', 'pickup', this.confirmFlag, page, 5).subscribe(
      resultData => {
        if (resultData) {
          this.sourceOrderHistoryList = resultData;
        }
      },
      error => {
        this.spinner.hide();
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('order-complete.component', `Get order list error type : ${errdata.type}`).error();
          this.logger.set('order-complete.component', `Get order list error message : ${errdata.message}`).error();
          this.alert.error({ message: `${errdata.message}` });
        }
      },
      () => { this.spinner.hide(); }
    );
  }

  /**
   * 컨펌 진행
   * @param evt
   */
  confirmECP(evt: any) {
    this.setSelected(evt);

    this.modal.openModalByComponent(EcpConfirmComponent,
      {
        callerData: { orderList: this.targetOrderHistoryList  },
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        modalId: 'EcpConfirmComponent'
      }
    );
  }

  /**
   * 영수증 출력
   * @param evt
   */
  printECP(evt: any) {
    this.setSelected(evt);

    if (this.targetOrderHistoryList) {
      const orderCodes = new Array<string>();
      this.targetOrderHistoryList.orders.forEach(order => {
        orderCodes.push(order.code);
      });
      this.spinner.show();
      this.orderService.orderDetails(this.targetOrderHistoryList.orders[0].user.uid, orderCodes).subscribe(
        orderDetail => {
          if (orderDetail) {
            try {
              this.receiptService.reissueReceipts(orderDetail);
              this.alert.info({ title: '영수증 재발행', message: this.messageService.get('receiptComplete') });
            } catch (e) {
              this.logger.set('pickup-order.component', `Reissue Receipts error type : ${e}`).error();
              this.alert.error({ title: '영수증 재발행', message: this.messageService.get('receiptFail') });
            }
          }
        },
        error => {
          this.spinner.hide();
          const errdata = Utils.getError(error);
          if (errdata) {
            this.logger.set('pickup-order.component', `Reissue Receipts error type : ${errdata.type}`).error();
            this.logger.set('pickup-order.component', `Reissue Receipts error message : ${errdata.message}`).error();
            this.alert.error({ message: `${errdata.message}` });
          }
        },
        () => { this.spinner.hide(); }
      );
    }
  }

  makeReceipt(orderDetail: Order): string {
    const tokenInfo = this.storageService.getTokenInfo();
    const terminalInfo = this.storageService.getTerminalInfo();
    const cashierId = tokenInfo.employeeName;
    const posNo = terminalInfo.id;
    const print = new StringBuilder();
    print.append(`<span class="logo"><img src="/assets/images/common/bill_logo.png" alt="Amway"></span>`);
    print.append(`<ul class="list">`);
    print.append(`    <li><span>주문형태</span><em>${this.orderTypeName}</em></li>`);
    print.append(`    <li><span>ABO정보</span><em>${orderDetail.user.uid} ${orderDetail.user.name}</em></li>`);
    print.append(`    <li><span>구매일자</span><em>${orderDetail.created} </em></li>`);
    print.append(`    <li><span>주문번호</span><em>${orderDetail.code}</em></li>`);
    print.append(`    <li><span>출력일자</span><em>${orderDetail.created}</em></li>`);
    print.append(`</ul>`);
    print.append(`<div class="scroll_tbl">`);
    print.append(`    <div>`);
    print.append(`        <table>`);
    print.append(`            <caption>주문내역</caption>`);
    print.append(`            <colgroup>`);
    print.append(`                <col style="width:20px">`);
    print.append(`                <col>`);
    print.append(`                <col style="width:70px">`);
    print.append(`                <col style="width:30px">`);
    print.append(`                <col style="width:70px">`);
    print.append(`            </colgroup>`);
    print.append(`            <thead>`);
    print.append(`                <tr>`);
    print.append(`                    <th scope="col">번호</th>`);
    print.append(`                    <th scope="col">상품명</th>`);
    print.append(`                    <th scope="col">단가</th>`);
    print.append(`                    <th scope="col">수량</th>`);
    print.append(`                    <th scope="col">금액</th>`);
    print.append(`                </tr>`);
    print.append(`            </thead>`);
    print.append(`            <tbody>`);
    orderDetail.entries.forEach(entry => {
      print.append(`                <tr>`);
      print.append(`                    <td>${entry.entryNumber + 1}</td>`);
      print.append(`                    <td><span class="blck">${entry.product.code}</span>${entry.product.name}</td>`);
      print.append(`                    <td>${entry.basePrice.value}</td>`);
      print.append(`                    <td>${entry.quantity}</td>`);
      print.append(`                    <td>${entry.totalPrice.value}</td>`);
      print.append(`                </tr>`);
    });
    print.append(`            </tbody>`);
    print.append(`        </table>`);
    print.append(`    </div>`);
    print.append(`</div>`);
    print.append(`<ul class="list">`);
    print.append(`    <li><span>상품수량</span><em>${orderDetail.totalUnitCount}</em></li>`);
    print.append(`    <li><span>과세물품</span><em>${orderDetail.subTotal.value}</em></li>`);
    print.append(`    <li><span>부&nbsp; 가&nbsp; 세</span><em>${orderDetail.totalTax}</em></li>`);
    print.append(`    <li class="txt_b"><span>합 &nbsp; &nbsp; &nbsp; &nbsp; 계</span><em>${orderDetail.code}1,000</em></li>`);
    print.append(`    <li class="txt_b"><span>할인금액</span><em>${orderDetail.code}1,000</em></li>`);
    print.append(`    <li><span>할인 쿠폰(신규 5%)</span><em>${orderDetail.code}1,000</em></li>`);
    print.append(`    <li><span>포인트차감(A포인트)</span><em>${orderDetail.code}1,000</em></li>`);
    print.append(`    <li class="txt_b"><span>결제금액</span><em>${orderDetail.code}1,000</em></li>`);
    print.append(`</ul>`);
    print.append(`<ul class="list">`);
    print.append(`    <li>[신용카드결제]</li>`);
    print.append(`    <li>카드번호:${orderDetail.code}32458****504</li>`);
    print.append(`    <li>할부: 일시불 (승인번호: ${orderDetail.code}37360868)</li>`);
    print.append(`</ul>`);
    print.append(`<ul class="list">`);
    print.append(`    <li class="fx"><span>PV</span><em>${orderDetail.code}</em></li>`);
    print.append(`    <li class="fx"><span>BV</span><em>${orderDetail.code}</em></li>`);
    print.append(`    <li class="fx"><span>PV SUM</span><em>${orderDetail.code}</em></li>`);
    print.append(`    <li class="fx"><span>BV SUM</span><em>${orderDetail.code}</em></li>`);
    print.append(`    <li class="fx"><span>GROUP PV</span><em>${orderDetail.code}</em></li>`);
    print.append(`    <li class="fx"><span>GROUP BV</span><em>${orderDetail.code}</em></li>`);
    print.append(`    <li><span>잔여 A 포인트</span><em>${orderDetail.code}00</em></li>`);
    print.append(`    <li>POS번호 및 캐셔 정보<br>POS No. ${posNo} / ${cashierId}</li>`);
    print.append(`    <li><span>공제번호</span><em>${orderDetail.code}8645571</em></li>`);
    print.append(`</ul>`);
    print.append(`<p class="txt">*** ${orderDetail.code}정상 승인 완료 ***</p>`);

    return print.toString();
  }


  close() {
    this.closeModal();
  }

  private setSelected(evt: any) {
    evt.stopPropagation();
    this.ecporders.forEach(ecporder => {
        parent = this.renderer.parentNode(ecporder.nativeElement);
      this.renderer.removeClass(parent, 'on');
      this.renderer.removeClass(ecporder.nativeElement, 'on');
    });
    parent = this.renderer.parentNode(evt.target);
    this.renderer.addClass(parent, 'on');
    this.renderer.addClass(evt.target, 'on');
  }
}
