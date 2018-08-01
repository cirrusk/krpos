import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ModalService, ModalComponent, AlertService } from '../../../core';
import { ProductInfo } from '../../../data';

@Component({
  selector: 'pos-update-item-qty',
  templateUrl: './update-item-qty.component.html'
})
export class UpdateItemQtyComponent extends ModalComponent implements OnInit {

  private code: string;
  private product: ProductInfo;
  @ViewChild('quantity') quantity: ElementRef;

  constructor(protected modalService: ModalService, private alert: AlertService) {
    super(modalService);
  }

  ngOnInit() {
    this.code = this.callerData.code;
    this.product = this.callerData.product;
    this.quantity.nativeElement.value = this.callerData.qty;
    setTimeout(() => { this.quantity.nativeElement.focus(); this.quantity.nativeElement.select(); }, 100); // 숫자를 지우고 입력해야해서 불편, 바로 수정가능하도록 수정
  }

  updateItemQty(quantity: number) {
    if (quantity < 1) {
      this.alert.warn({ message: '수량이 1보다 작습니다.' });
    } else {
      const hasSerialOrRfid = this.product.serialNumber || this.product.rfid;
      const baseqty = this.callerData.qty;
      if (hasSerialOrRfid && (baseqty > quantity)) {
        this.alert.warn({ message: `Serial / RFID 상품은 상품 삭제 후 처음부터 다시 입력하여야 합니다.`, timer: true, interval: 1000 });
        setTimeout(() => { this.quantity.nativeElement.focus(); this.quantity.nativeElement.select(); }, 250);
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
