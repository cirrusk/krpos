import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ModalService, ModalComponent, AlertService } from '../../../core';
import { UpdateItemQtyBroker } from '../../../broker';

@Component({
  selector: 'pos-update-item-qty',
  templateUrl: './update-item-qty.component.html'
})
export class UpdateItemQtyComponent extends ModalComponent implements OnInit {

  private code: string;
  @ViewChild('quantity') quantity: ElementRef;

  constructor(protected modalService: ModalService,
    private alert: AlertService,
    private updateItemQtyBroker: UpdateItemQtyBroker) {
    super(modalService);
  }

  ngOnInit() {
    this.code = this.callerData.code;
    this.quantity.nativeElement.value = this.callerData.qty;
    setTimeout(() => { this.quantity.nativeElement.focus(); this.quantity.nativeElement.select(); }, 100); // 숫자를 지우고 입력해야해서 불편, 바로 수정가능하도록 수정
  }

  updateItemQty(quantity: number) {
    if (quantity < 1) {
      this.alert.warn({ message: '수량이 1보다 작습니다.' });
    } else {
      const data = { code: this.code, qty: quantity };
      this.updateItemQtyBroker.sendInfo(data);
      this.close();
    }
  }

  close() {
    this.closeModal();
  }

}
