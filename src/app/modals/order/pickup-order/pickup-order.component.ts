import { Component, OnInit, ViewChildren, QueryList, ElementRef, Renderer2 } from '@angular/core';

import { EcpPrintComponent } from './../ecp-print/ecp-print.component';
import { ModalComponent, ModalService, Modal } from '../../../core';

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

    const print = `<span class="logo"><img src="/assets/images/common/bill_logo.png" alt="Amway"></span>
    <ul class="list">
        <li><span>주문형태</span><em>픽업예약주문</em></li>
        <li><span>ABO정보</span><em>74800002 박길녀 &amp; 김천억</em></li>
        <li><span>구매일자</span><em>2018/01/30 15:53:55</em></li>
        <li><span>주문번호</span><em>232320175**</em></li>
        <li><span>출력일자</span><em>2018/03/14 16:33:22</em></li>
        <li><span>인수자</span><em>3456732 / 암돌이</em></li>
    </ul>
    <div class="scroll_tbl">
        <div>
            <table>
                <caption>주문내역</caption>
                <colgroup>
                    <col style="width:20px">
                    <col>
                    <col style="width:70px">
                    <col style="width:30px">
                    <col style="width:70px">
                </colgroup>
                <thead>
                    <tr>
                        <th scope="col">번호</th>
                        <th scope="col">상품명</th>
                        <th scope="col">단가</th>
                        <th scope="col">수량</th>
                        <th scope="col">금액</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>999</td>
                        <td><span class="blck">1322424323</span>에멀전에멀전에멀전에멀전에멀전에멀전에멀전</td>
                        <td>123,000,000</td>
                        <td>888</td>
                        <td>333,000</td>
                    </tr>
                    <tr>
                        <td>88</td>
                        <td><span class="blck">1322424323</span>에멀전</td>
                        <td>123,000</td>
                        <td>88</td>
                        <td>333,000</td>
                    </tr>
                    <tr>
                        <td>88</td>
                        <td><span class="blck">1322424323</span>에멀전</td>
                        <td>123,000</td>
                        <td>88</td>
                        <td>333,000</td>
                    </tr>
                    <tr>
                        <td>88</td>
                        <td><span class="blck">1322424323</span>에멀전</td>
                        <td>123,000</td>
                        <td>88</td>
                        <td>333,000</td>
                    </tr>
                    <tr>
                        <td>88</td>
                        <td><span class="blck">1322424323</span>에멀전</td>
                        <td>123,000</td>
                        <td>88</td>
                        <td>333,000</td>
                    </tr>
                    <tr>
                        <td>88</td>
                        <td><span class="blck">1322424323</span>에멀전</td>
                        <td>123,000</td>
                        <td>88</td>
                        <td>333,000</td>
                    </tr>
                    <tr>
                        <td>88</td>
                        <td><span class="blck">1322424323</span>에멀전</td>
                        <td>123,000</td>
                        <td>88</td>
                        <td>333,000</td>
                    </tr>
                    <tr>
                        <td>88</td>
                        <td><span class="blck">1322424323</span>에멀전</td>
                        <td>123,000</td>
                        <td>88</td>
                        <td>333,000</td>
                    </tr>
                    <tr>
                        <td>88</td>
                        <td><span class="blck">1322424323</span>에멀전</td>
                        <td>123,000</td>
                        <td>88</td>
                        <td>333,000</td>
                    </tr>
                    <tr>
                        <td>88</td>
                        <td><span class="blck">1322424323</span>에멀전</td>
                        <td>123,000</td>
                        <td>88</td>
                        <td>333,000</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <ul class="list">
        <li><span>상품수량</span><em>3</em></li>
        <li><span>과세물품</span><em>333,000</em></li>
        <li><span>부&nbsp; 가&nbsp; 세</span><em>333,333</em></li>
        <li class="txt_b"><span>합 &nbsp; &nbsp; &nbsp; &nbsp; 계</span><em>1,000</em></li>
        <li class="txt_b"><span>할인금액</span><em>1,000</em></li>
        <li><span>할인 쿠폰(신규 5%)</span><em>1,000</em></li>
        <li><span>포인트차감(A포인트)</span><em>1,000</em></li>
        <li class="txt_b"><span>결제금액</span><em>1,000</em></li>
    </ul>
    <ul class="list">
        <li>[신용카드결제]</li>
        <li>카드번호:32458****504</li>
        <li>할부: 일시불 (승인번호: 37360868)</li>
    </ul>
    <ul class="list">
        <li class="fx"><span>PV</span><em></em></li>
        <li class="fx"><span>BV</span><em></em></li>
        <li class="fx"><span>PV SUM</span><em></em></li>
        <li class="fx"><span>BV SUM</span><em></em></li>
        <li class="fx"><span>GROUP PV</span><em></em></li>
        <li class="fx"><span>GROUP BV</span><em></em></li>
        <li><span>잔여 A 포인트</span><em>00</em></li>
        <li>POS번호 및 캐셔 정보<br>POS No. KR141022 / Lee, YunSeo</li>
        <li><span>공제번호</span><em>8645571</em></li>
    </ul>
    <p class="txt">*** 정상 승인 완료 ***</p>`;

    this.modal.openModalByComponent(EcpPrintComponent,
      {
        title: '',
        message: print,
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
