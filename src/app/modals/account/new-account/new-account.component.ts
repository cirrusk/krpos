import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ModalComponent } from '../../../core/modal/modal.component';
import { ModalService } from '../../../service/pos';
import { OnlyNumberDirective } from '../../../core/common/only-number.directive';

@Component({
  selector: 'pos-new-account',
  templateUrl: './new-account.component.html'
})
export class NewAccountComponent extends ModalComponent implements OnInit, OnDestroy {

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

  saveNewCustomer() {
    console.log(`phone type : ${this.phonetype}, user phone number : ${this.userPhone}, 개인정보 동의 : ${this.agree}, 간편선물 : ${this.guser}`);

    // API로 보내고 나서 성공 시 close
    this.close();
  }

  close() {
     this.closeModal();
  }

}
