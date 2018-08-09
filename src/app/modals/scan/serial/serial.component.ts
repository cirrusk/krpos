import { Component, OnInit, OnDestroy, ElementRef, ViewChildren, QueryList, HostListener } from '@angular/core';

import { range } from 'lodash';
import { ModalComponent, ModalService } from '../../../core';
import { KeyCode, StatusDisplay } from '../../../data';
import { Utils } from '../../../core/utils';
import { Product } from '../../../data/models/cart/cart-data';

/**
 * Serial / RFID 입력
 *
 * 처리 절차
 *   1.	제품의 바코드를 스캔
 *   2.	POS 는 바코드 값으로 Hybris 에 제품 검색
 *   3.	검색 결과 Serial 또는 RFID 포함 제품인 경우,
 *     1)	'1 개 입력용 Serial, RFID 입력 팝업' 출력
 *         -	입력용 text 필드 있어야 함
 *         -	text 필드가 비어 있어도 닫을 수 있음 (Backoffice 를 활용해 후처리)
 *   4.	1 부터 제품 스캔을 계속 또는 아래 5번 수량변경 기능으로 이동
 *
 * 수량 변경 기능 : 상품을 클릭하여 활성화한 후 수량 변경 키보드 키를 누르고, 수량을 수정함
 *   5.	캐셔는 상품 선택 : 수량변경 키 누름 을 차례로 실행해 수량 변경 팝업 띄움
 *   6.	변경할 수량 입력 후 확인 클릭
 *     1)	해당 상품이 Serial / RFID 상품이면,
 *        -> 수량이 적어지면,
 *           'Serial / RFID 상품은 상품 삭제 후 처음부터 다시 입력하여야 합니다.' 앨러트 출력
 *           수량 변동 없이 수량변경 팝업 닫힘
 *       	-> 수량이 늘어나면,
 *           늘어난 수량 만큼 입력용 Serial, RFID 입력 팝업 출력
 *           컬럼은 순번, Serial 또는 RFID 값
 *           이미 입력된 상품의 Serial, RFID 가 상단에 출력
 *           추가할 개수만큼 빈 텍스트 필드들 출력
 *           1건을 바코드, Serial 입력하고 10으로 수량변경 한다면, 최상단 1건은 <span>1 시리얼 값</span>
 *           2행부터 10행까지는 순번 [          ] (빈 텍스트 필드) 출력
 *           text 필드가 비어 있어도 닫을 수 있음 (Backoffice 를 활용해 후처리)
 *
 * 스크롤은 vertical scrollbar (페이지 X)
 * 다음 빈 칸으로 자동 포커싱 되어야 함
 * (처음에는 2행에 포커싱, 입력 후 엔터키 치면 3행으로 포커스 이동) 스캐너에서 자동 엔터키 입력됨
 *
 * @since 2018.08.09 RFID를 Serial에 통합
 */
@Component({
  selector: 'pos-serial',
  templateUrl: './serial.component.html'
})
export class SerialComponent extends ModalComponent implements OnInit, OnDestroy {
  regLabel: string;
  finishStatus: string;
  checktype: number;
  apprmessage: string;
  productInfo: Product;
  productCount = [];
  serial: string;
  private dupcheck = false;
  private serialNumbers = [];
  private scanInputSize: number;
  private scannedCount: number;
  @ViewChildren('codes') codes: QueryList<ElementRef>;
  constructor(protected modalService: ModalService) {
    super(modalService);
    this.finishStatus = null;
    this.checktype = 0;
    this.scanInputSize = 0;
    this.scannedCount = 0;
  }

  ngOnInit() {
    this.productInfo = this.callerData.productInfo;
    this.serial = this.callerData.serial;
    const osize: number = this.callerData.cartQty ? this.callerData.cartQty : 0; // 카트에 담긴 제품 수량
    const psize: number = this.callerData.productQty ? this.callerData.productQty : 1; // 수량변경한 제품 수량
    if (psize === 0) {
      this.productCount = range(0, 1);
    } else {
      this.scanInputSize = psize - osize;
      this.productCount = range(0, this.scanInputSize);
    }
    if (this.productInfo) {
      this.regLabel = '시리얼 번호 입력 / RFID 스캔';
    }
    setTimeout(() => { this.codes.first.nativeElement.focus(); }, 50);
  }

  ngOnDestroy() { }

  /**
   * 입력 체크하기
   *
   * 중요 변경 사항)
   * 시리얼 번호 또는 RFID 가 인식되지 않는 경우
   * Blank 상태로 [확인] Btn 터치 or [ENTER] KEY 입력/처리 가능
   *
   * @param {any} codes 입력한 input 요소
   * @param {any} evt 이벤트
   */
  check(codes: any, evt: any) {
    evt.preventDefault();
    const code = codes.value;
    // if (evt.srcElement.nextElementSibling) { // 다음 요소가 있음.(INPUT 요소끼리 인접해있을 경우)
    // evt.srcElement.nextElementSibling.focus();
    if (evt.srcElement.parentElement.nextElementSibling) { // INPUT 요소를 한번 감싸고 있을 경우
      const elms = evt.srcElement.parentElement.nextElementSibling.childNodes;
      elms.forEach(elm => {
        if (elm.nodeType === 1 && elm.nodeName === 'INPUT') {
          elm.focus();
        }
      });
      this.scannedCount++;
    } else { // 마지막 요소임.
      this.scannedCount++;
      evt.srcElement.blur();
    }
    let chkidx = 0;
    if (Utils.isEmpty(code)) {
      chkidx++;
    }
    if (this.scanInputSize === this.scannedCount) {
      this.finishStatus = StatusDisplay.PAID;
      this.apprmessage = '스캔이 완료되었습니다.';
    }
  }

  /**
   * Serial / RFID 입력하기
   * Serial / RFID 가 배열로 입력되도록
   * API가 변경되었으므로 기존의 string 은
   * 빈값으로 처리하거나 제거하도록 함.
   */
  reg() {
    let stype: string;
    let rtype: string;
    let scannedRegCount = 0;

    this.codes.forEach(cd => {
      if (cd.nativeElement.getAttribute('type') === 'text') {
        if (Utils.isEmpty(cd.nativeElement.value)) {
          scannedRegCount++;
        } else {
          stype = cd.nativeElement.getAttribute('data-serial') ? cd.nativeElement.getAttribute('data-serial') : 'false';
          rtype = cd.nativeElement.getAttribute('data-rfid') ? cd.nativeElement.getAttribute('data-rfid') : 'false';
          if (stype === 'true' || rtype === 'true') {
            this.serialNumbers.push(cd.nativeElement.value);
            scannedRegCount++;
          }
        }
      }
    });
    this.checktype = 0;
    this.apprmessage = '스캔이 완료되었습니다.';
    console.log(this.scanInputSize);
    console.log(scannedRegCount);
    if (this.scanInputSize === scannedRegCount) {
      this.result = { serialNumbers: this.serialNumbers };
      this.close();
    }
  }

  close() {
    this.closeModal();
  }

  @HostListener('document:keydown', ['$event'])
  onSerialKeyBoardDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      if (this.finishStatus === StatusDisplay.PAID) {
        if (!this.dupcheck) {
          setTimeout(() => { this.reg(); }, 300);
          this.dupcheck = true;
        }
      }
    }
  }

}
