import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ModalComponent } from '../../../core/modal/modal.component';
import { ModalService } from '../../../service/pos';
import { OnlyNumberDirective } from '../../../core/common/only-number.directive';

@Component({
  selector: 'pos-new-customer',
  templateUrl: './new-customer.component.html'
})
export class NewCustomerComponent extends ModalComponent implements OnInit, OnDestroy {

  @Input() userPhone: string;
  @Input() phonetype: string; // 휴대폰/전화번호 타입 선택
  @Input() agree: boolean;  // 개인정보수집 및 이용동의
  @Input() guser: boolean; // 간편선물 받은 사용자 여부
  constructor(modalService: ModalService) {
    super(modalService);
    this.phonetype = 'm';
    this.agree = true;
    this.guser = false;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  close() {
     this.closeModal();
  }

}
