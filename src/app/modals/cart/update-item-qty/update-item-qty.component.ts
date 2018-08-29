import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ModalService, ModalComponent, AlertService } from '../../../core';
import { ProductInfo, KeyCode } from '../../../data';
import { MessageService } from '../../../service';
import { Utils } from '../../../core/utils';

/**
 * 장바구니 추가 제품의 수량변경
 */
@Component({
  selector: 'pos-update-item-qty',
  templateUrl: './update-item-qty.component.html'
})
export class UpdateItemQtyComponent extends ModalComponent implements OnInit {

  private code: string;
  private product: ProductInfo;
  @ViewChild('quantity') quantity: ElementRef;

  constructor(protected modalService: ModalService,
    private message: MessageService,
    private alert: AlertService) {
    super(modalService);
  }

  ngOnInit() {
    this.code = this.callerData.code;
    this.product = this.callerData.product;
    this.quantity.nativeElement.value = this.callerData.qty;
    setTimeout(() => { this.quantity.nativeElement.focus(); this.quantity.nativeElement.select(); }, 100); // 숫자를 지우고 입력해야해서 불편, 바로 수정가능하도록 수정
  }

  keyDownNumCheck(evt: any) {
    const key = evt.keyCode;
    if (evt.key === 'Process') { evt.preventDefault(); return; }
    if (key === 0 || key === KeyCode.BACKSPACE || key === KeyCode.DELETE || key === KeyCode.TAB) {
      evt.stopPropagation();
      return;
    }
    if (key < KeyCode.KEY_0 || (key > KeyCode.KEY_9 && key < KeyCode.NUMPAD_0) || key > KeyCode.NUMPAD_9) {
      evt.preventDefault();
    }
    evt.target.value = evt.target.value.replace(/[^0-9]/g, '');
  }

  keyUpNumCheck(evt: any) {
    const key = evt.keyCode;
    if (key === KeyCode.BACKSPACE || key === KeyCode.DELETE || key === KeyCode.LEFT_ARROW || key === KeyCode.RIGHT_ARROW) {
      return;
    } else {
      evt.target.value = evt.target.value.replace(/[^0-9]/g, '');
    }
  }

  focusOutNumCheck(evt: any) {
    evt.target.value = evt.target.value.replace(/[^0-9]/g, '');
  }

  /**
   * 제품 수량 변경 업데이트
   *
   * Serial /RFID 가 있을 경우는 수량 감소는 처리하지 않음.
   * 해당 상품 취소 후 다시 입력 처리
   *
   * @param {number} quantity 변경 제품 수량
   */
  updateItemQty(quantity: number) {
    if (quantity < 1) {
      this.alert.warn({ message: '수량이 1보다 작습니다.', timer: true, interval: 1500 });
      setTimeout(() => { this.quantity.nativeElement.focus(); this.quantity.nativeElement.select(); }, 1520);
    } else {
      const hasSerialOrRfid = this.product.serialNumber || this.product.rfid;
      const baseqty = this.callerData.qty;
      if (hasSerialOrRfid && (baseqty > quantity)) {
        this.alert.warn({ message: this.message.get('update.qty.invalid'), timer: true, interval: 1500 });
        setTimeout(() => { this.quantity.nativeElement.focus(); this.quantity.nativeElement.select(); }, 1520);
        return;
      }
      this.result = { code: this.code, qty: quantity };
      this.close();
    }
  }

  close() {
    this.closeModal();
  }

}
