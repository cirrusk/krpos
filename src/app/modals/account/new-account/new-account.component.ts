import { Component, OnInit, OnDestroy, Input, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Modal, ModalComponent, ModalService, AlertService, AlertType, OnlyNumberDirective } from '../../../core';
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
  private modalsubscription: Subscription;
  private listner: any;
  constructor(protected modalService: ModalService,
    private modal: Modal,
    private alert: AlertService,
    private renderer: Renderer2) {
    super(modalService);
    this.phonetype = 'm';
    this.agree = true;
    this.guser = false;
  }

  ngOnInit() {
    this.listner = this.renderer.listen('document', 'keydown:enter', evt => {
      console.log('ENTER');
    });
  }

  ngOnDestroy() {
    this.listner(); // remove listener
    if (this.modalsubscription) { this.modalsubscription.unsubscribe(); }
  }

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
    if (this.agree) {
      this.modalsubscription = this.modal.openConfirm(
        {
          title: '개인정보 수집 및 이용 동의 확인',
          message: `암웨이 코리아의 고객님<br>개인정보 수집 및 이용에 동의하시겠습니까?`,
          actionButtonLabel: '확인',
          closeButtonLabel: '취소',
          closeByClickOutside: false,
          modalId: 'AGREE'
        }
      ).subscribe(result => {
        if (result) {
          // API 처리
          console.log('call new account register api...');
        }
      });
    }

  }

  close() {
     this.closeModal();
  }

}
