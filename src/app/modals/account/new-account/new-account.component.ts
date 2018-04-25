import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ModalComponent, AlertService, ModalService, AlertType, OnlyNumberDirective } from '../../../core';
import Utils from '../../../core/utils';

@Component({
  selector: 'pos-new-account',
  templateUrl: './new-account.component.html'
})
export class NewAccountComponent extends ModalComponent implements OnInit, OnDestroy {

  @Input() userPhone: string;
  @Input() phonetype: string; // 휴대폰/전화번호 타입 선택
  @Input() agree: boolean;  // 개인정보수집 및 이용동의
  @Input() guser: boolean; // 간편선물 받은 사용자 여부
  constructor(protected modalService: ModalService, private alert: AlertService) {
    super(modalService);
    this.phonetype = 'm';
    this.agree = true;
    this.guser = false;
  }

  ngOnInit() { }

  ngOnDestroy() { }

  /**
   * 신규 사용자 저장
   *
   * INPUT 에서 ENTER 이벤트가 발생하기 때문에
   * alert 창의 ENTER 닫기 이벤트까지 fired 됨(INPUT에 focus 있음).
   * 반드시 INPUT을 blur 처리를 실행한 후에 alert 오픈해야함.
   *
   * @param el 휴대폰/전화번호 INPUT element
   */
  saveNewCustomer(el) {
    if (Utils.isEmpty(this.userPhone) || this.userPhone.length < 11) {
      el.blur(); // 주의) 이렇게 처리해야만 alert 에서 이벤트 동작!
      this.alert.show( {alertType: AlertType.warn, message: '입력 형식이 맞지 않습니다'} );
      return;
    }
    console.log(`[1]phone type : ${this.phonetype}, user phone number : ${this.userPhone}, 개인정보 동의 : ${this.agree}, 간편선물 : ${this.guser}`);

    // API로 보내고 나서 성공 시 close
    // this.close();
  }

  close() {
     this.closeModal();
  }

}
