import { Component, OnInit, ViewChildren, QueryList, ElementRef, Renderer2 } from '@angular/core';

import { EcpPrintComponent } from '../ecp-print/ecp-print.component';
import { EcpConfirmComponent } from '../ecp-confirm/ecp-confirm.component';
import { ModalComponent, ModalService, Modal, SpinnerService, Logger, AlertService, StorageService } from '../../../core';
import { StringBuilder, Utils } from '../../../core/utils';
import { OrderHistory } from '../../../data';
import { OrderService } from '../../../service';
import { Order } from '../../../data/models/order/order';

@Component({
  selector: 'pos-pickup-order',
  templateUrl: './pickup-order.component.html'
})
export class PickupOrderComponent extends ModalComponent implements OnInit {
  @ViewChildren('ecporders') ecporders: QueryList<ElementRef>;
  private orderInfo: OrderHistory;
  private order: Order;
  private orderType: string;

  searchType: string;

  constructor(protected modalService: ModalService,
              private orderService: OrderService,
              private modal: Modal,
              private spinner: SpinnerService,
              private storageService: StorageService,
              private logger: Logger,
              private alert: AlertService,
              private renderer: Renderer2) {
    super(modalService);
  }

  ngOnInit() {
    this.searchType = this.callerData.type;

    if (this.searchType === 'e') {
      this.orderType = '간편선물';
    } else if (this.searchType === 'i') {
      this.orderType = '설치주문';
    } else {
      this.orderType = '픽업예약주문';
    }
  }

  confirmECP(evt: any) {
    this.setSelected(evt);

    this.modal.openModalByComponent(EcpConfirmComponent,
      {
        callerData: { order: this.order  },
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        modalId: 'EcpConfirmComponent'
      }
    );
  }

  printECP(evt: any) {
    this.setSelected(evt);

    if (this.orderInfo) {
      this.spinner.show();
      this.orderService.getOrderDetail(this.orderInfo.code).subscribe(
        orderDetail => {
          if (orderDetail) {
            this.order = orderDetail;
            const receipt = this.makeReceipt(this.order);
            this.modal.openModalByComponent(EcpPrintComponent,
              {
                message: receipt,
                actionButtonLabel: '확인',
                closeButtonLabel: '취소',
                modalId: 'EcpPrintComponent'
              }
            );
          }
        },
        error => {
          this.spinner.hide();
          const errdata = Utils.getError(error);
          if (errdata) {
            this.logger.set('pickup-order.component', `Get Order Detail error type : ${errdata.type}`).error();
            this.logger.set('pickup-order.component', `Get Order Detail error message : ${errdata.message}`).error();
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
    print.append(`    <li><span>주문형태</span><em>${orderDetail.code}픽업예약주문</em></li>`);
    print.append(`    <li><span>ABO정보</span><em>${orderDetail.code}74800002 ${orderDetail.code}박길녀 &amp; 김천억</em></li>`);
    print.append(`    <li><span>구매일자</span><em>${orderDetail.code}2018/01/30 15:53:55</em></li>`);
    print.append(`    <li><span>주문번호</span><em>${orderDetail.code}232320175**</em></li>`);
    print.append(`    <li><span>출력일자</span><em>${orderDetail.code}2018/03/14 16:33:22</em></li>`);
    print.append(`    <li><span>인수자</span><em>${orderDetail.code}3456732 / ${orderDetail.code}암돌이</em></li>`);
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
      print.append(`                    <td>${entry.entryNumber}999</td>`);
      print.append(`                    <td><span class="blck">${entry.product.name}1322424323</span>에멀전에멀전에멀전에멀전에멀전에멀전에멀전</td>`);
      print.append(`                    <td>${entry.product.price.value}123,000,000</td>`);
      print.append(`                    <td>${entry.quantity}888</td>`);
      print.append(`                    <td>${entry.totalPrice.value}333,000</td>`);
      print.append(`                </tr>`);
    });
    print.append(`            </tbody>`);
    print.append(`        </table>`);
    print.append(`    </div>`);
    print.append(`</div>`);
    print.append(`<ul class="list">`);
    print.append(`    <li><span>상품수량</span><em>${orderDetail.code}3</em></li>`);
    print.append(`    <li><span>과세물품</span><em>${orderDetail.code}333,000</em></li>`);
    print.append(`    <li><span>부&nbsp; 가&nbsp; 세</span><em>${orderDetail.code}333,333</em></li>`);
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
