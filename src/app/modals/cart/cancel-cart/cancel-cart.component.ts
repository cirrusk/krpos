import { Component, OnInit, HostListener } from '@angular/core';
import { ModalComponent } from '../../../core/modal/modal.component';
import { ModalService } from '../../../core';
import { CancleOrderBroker } from '../../../broker';
import { KeyCode } from '../../../data';

/**
 * 장바구니 삭제 팝업
 */
@Component({
  selector: 'pos-cancel-cart',
  templateUrl: './cancel-cart.component.html'
})
export class CancelCartComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService,
              private cancleOrderBroker: CancleOrderBroker) {
    super(modalService);
  }

  ngOnInit() {
  }

  /**
   * 장바구니 삭제
   */
  cancleOrder() {
    // 장바구니 삭제 진행
    this.cancleOrderBroker.sendInfo('delCart');
    this.close();
  }

  close() {
    this.closeModal();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyBoardDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      this.cancleOrder();
    }
  }
}
