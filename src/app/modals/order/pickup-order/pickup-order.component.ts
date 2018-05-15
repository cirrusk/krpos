import { Component, OnInit, ViewChildren, QueryList, ElementRef, Renderer2 } from '@angular/core';

import { EcpPrintComponent } from '../ecp-print/ecp-print.component';
import { ModalComponent, ModalService, Modal } from '../../../core';
import { StringBuilder } from '../../../core/utils';

@Component({
  selector: 'pos-pickup-order',
  templateUrl: './pickup-order.component.html'
})
export class PickupOrderComponent extends ModalComponent implements OnInit {
  @ViewChildren('ecporders') ecporders: QueryList<ElementRef>;
  constructor(protected modalService: ModalService, private modal: Modal, private renderer: Renderer2) {
    super(modalService);
  }

  ngOnInit() {
  }

  confirmECP(evt: any) {
    this.setSelected(evt);
  }

  printECP(evt: any) {
    this.setSelected(evt);

    const print = new StringBuilder();
    print.append(`<span class="logo"><img src="/assets/images/common/bill_logo.png" alt="Amway"></span>`);
    print.append(`<ul class="list">`);
    print.append(`    <li><span>주문형태</span><em>픽업예약주문</em></li>`);
    print.append(`    <li><span>ABO정보</span><em>74800002 박길녀 &amp; 김천억</em></li>`);
    print.append(`    <li><span>구매일자</span><em>2018/01/30 15:53:55</em></li>`);
    print.append(`    <li><span>주문번호</span><em>232320175**</em></li>`);
    print.append(`    <li><span>출력일자</span><em>2018/03/14 16:33:22</em></li>`);
    print.append(`    <li><span>인수자</span><em>3456732 / 암돌이</em></li>`);
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
    print.append(`                <tr>`);
    print.append(`                    <td>999</td>`);
    print.append(`                    <td><span class="blck">1322424323</span>에멀전에멀전에멀전에멀전에멀전에멀전에멀전</td>`);
    print.append(`                    <td>123,000,000</td>`);
    print.append(`                    <td>888</td>`);
    print.append(`                    <td>333,000</td>`);
    print.append(`                </tr>`);
    print.append(`                <tr>`);
    print.append(`                    <td>88</td>`);
    print.append(`                    <td><span class="blck">1322424323</span>에멀전</td>`);
    print.append(`                    <td>123,000</td>`);
    print.append(`                    <td>88</td>`);
    print.append(`                    <td>333,000</td>`);
    print.append(`                </tr>`);
    print.append(`                <tr>`);
    print.append(`                    <td>88</td>`);
    print.append(`                    <td><span class="blck">1322424323</span>에멀전</td>`);
    print.append(`                    <td>123,000</td>`);
    print.append(`                    <td>88</td>`);
    print.append(`                    <td>333,000</td>`);
    print.append(`                </tr>`);
    print.append(`                <tr>`);
    print.append(`                    <td>88</td>`);
    print.append(`                    <td><span class="blck">1322424323</span>에멀전</td>`);
    print.append(`                    <td>123,000</td>`);
    print.append(`                    <td>88</td>`);
    print.append(`                    <td>333,000</td>`);
    print.append(`                </tr>`);
    print.append(`                <tr>`);
    print.append(`                    <td>88</td>`);
    print.append(`                    <td><span class="blck">1322424323</span>에멀전</td>`);
    print.append(`                    <td>123,000</td>`);
    print.append(`                    <td>88</td>`);
    print.append(`                    <td>333,000</td>`);
    print.append(`                </tr>`);
    print.append(`                <tr>`);
    print.append(`                    <td>88</td>`);
    print.append(`                    <td><span class="blck">1322424323</span>에멀전</td>`);
    print.append(`                    <td>123,000</td>`);
    print.append(`                    <td>88</td>`);
    print.append(`                    <td>333,000</td>`);
    print.append(`                </tr>`);
    print.append(`                <tr>`);
    print.append(`                    <td>88</td>`);
    print.append(`                    <td><span class="blck">1322424323</span>에멀전</td>`);
    print.append(`                    <td>123,000</td>`);
    print.append(`                    <td>88</td>`);
    print.append(`                    <td>333,000</td>`);
    print.append(`                </tr>`);
    print.append(`                <tr>`);
    print.append(`                    <td>88</td>`);
    print.append(`                    <td><span class="blck">1322424323</span>에멀전</td>`);
    print.append(`                    <td>123,000</td>`);
    print.append(`                    <td>88</td>`);
    print.append(`                    <td>333,000</td>`);
    print.append(`                </tr>`);
    print.append(`                <tr>`);
    print.append(`                    <td>88</td>`);
    print.append(`                    <td><span class="blck">1322424323</span>에멀전</td>`);
    print.append(`                    <td>123,000</td>`);
    print.append(`                    <td>88</td>`);
    print.append(`                    <td>333,000</td>`);
    print.append(`                </tr>`);
    print.append(`                <tr>`);
    print.append(`                    <td>88</td>`);
    print.append(`                    <td><span class="blck">1322424323</span>에멀전</td>`);
    print.append(`                    <td>123,000</td>`);
    print.append(`                    <td>88</td>`);
    print.append(`                    <td>333,000</td>`);
    print.append(`                </tr>`);
    print.append(`            </tbody>`);
    print.append(`        </table>`);
    print.append(`    </div>`);
    print.append(`</div>`);
    print.append(`<ul class="list">`);
    print.append(`    <li><span>상품수량</span><em>3</em></li>`);
    print.append(`    <li><span>과세물품</span><em>333,000</em></li>`);
    print.append(`    <li><span>부&nbsp; 가&nbsp; 세</span><em>333,333</em></li>`);
    print.append(`    <li class="txt_b"><span>합 &nbsp; &nbsp; &nbsp; &nbsp; 계</span><em>1,000</em></li>`);
    print.append(`    <li class="txt_b"><span>할인금액</span><em>1,000</em></li>`);
    print.append(`    <li><span>할인 쿠폰(신규 5%)</span><em>1,000</em></li>`);
    print.append(`    <li><span>포인트차감(A포인트)</span><em>1,000</em></li>`);
    print.append(`    <li class="txt_b"><span>결제금액</span><em>1,000</em></li>`);
    print.append(`</ul>`);
    print.append(`<ul class="list">`);
    print.append(`    <li>[신용카드결제]</li>`);
    print.append(`    <li>카드번호:32458****504</li>`);
    print.append(`    <li>할부: 일시불 (승인번호: 37360868)</li>`);
    print.append(`</ul>`);
    print.append(`<ul class="list">`);
    print.append(`    <li class="fx"><span>PV</span><em></em></li>`);
    print.append(`    <li class="fx"><span>BV</span><em></em></li>`);
    print.append(`    <li class="fx"><span>PV SUM</span><em></em></li>`);
    print.append(`    <li class="fx"><span>BV SUM</span><em></em></li>`);
    print.append(`    <li class="fx"><span>GROUP PV</span><em></em></li>`);
    print.append(`    <li class="fx"><span>GROUP BV</span><em></em></li>`);
    print.append(`    <li><span>잔여 A 포인트</span><em>00</em></li>`);
    print.append(`    <li>POS번호 및 캐셔 정보<br>POS No. KR141022 / Lee, YunSeo</li>`);
    print.append(`    <li><span>공제번호</span><em>8645571</em></li>`);
    print.append(`</ul>`);
    print.append(`<p class="txt">*** 정상 승인 완료 ***</p>`);
    this.modal.openModalByComponent(EcpPrintComponent,
      {
        message: print.toString(),
        actionButtonLabel: '확인',
        closeButtonLabel: '취소',
        modalId: 'EcpPrintComponent'
      }
    );
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
