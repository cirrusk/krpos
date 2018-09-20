import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ModalComponent, AlertService, ModalService, Logger, Modal, StorageService, SpinnerService } from '../../../core';
import { Utils } from '../../../core/utils';
import { AccountList, ModalIds, ConsumerRegister, KeyCode } from '../../../data';
import { AccountService, MessageService } from '../../../service';
import { SignupAccountComponent } from './signup-account/signup-account.component';

/**
 * 비회원 등록 팝업
 */
@Component({
  selector: 'pos-client-account',
  templateUrl: './client-account.component.html'
})
export class ClientAccountComponent extends ModalComponent implements OnInit, OnDestroy {

  private createAccountSubscription: Subscription;
  private registerType: string;
  private account: AccountList;
  @Input() userPhone: string;
  @Input() phonetype: string; // 휴대폰/전화번호 타입 선택
  @Input() agree: boolean;  // 개인정보수집 및 이용동의
  @Input() guser: boolean; // 간편선물 받은 사용자 여부
  @Input() sponsorNo: string; // 후원자 번호
  @ViewChild('phoneNumText') private phoneNumText: ElementRef;

  // spinnerService 는 HostListener 사용중
  constructor(protected modalService: ModalService,
    private modal: Modal,
    private message: MessageService,
    private alert: AlertService,
    private storageService: StorageService,
    private accountService: AccountService,
    private spinnerService: SpinnerService,
    private logger: Logger) {
    super(modalService);
    this.phonetype = 'MOBILE';
    this.agree = true;
    this.guser = false;
  }

  ngOnInit() {
    setTimeout(() => { this.phoneNumText.nativeElement.focus(); }, 100); // 모달 팝업 포커스 보다 timeout을 더주어야 focus 잃지 않음.
  }

  ngOnDestroy() {
    if (this.createAccountSubscription) { this.createAccountSubscription.unsubscribe(); }
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
    if (Utils.isEmpty(this.userPhone) || (this.userPhone.length < 9 || this.userPhone.length > 11)) {
      el.blur(); // 주의) 이렇게 처리해야만 alert 에서 이벤트 동작!
      this.alert.warn({ message: '입력 형식이 맞지 않습니다.', timer: true, interval: 1500 });
      setTimeout(() => { this.phoneNumText.nativeElement.focus(); }, 1520);
      return;
    }
    if (this.agree) {
      setTimeout(() => {
        if (this.guser) {
          this.modal.openModalByComponent(SignupAccountComponent, {
            callerData: { phonetype: this.phonetype, userPhone: this.userPhone},
            closeByClickOutside: false,
            closeByEnter: false,
            closeByEscape: true,
            modalId: ModalIds.SIGNUPACCOUNT
          }).subscribe(
            result => {
              if (result) {
                this.account = result;
                this.result = this.account.accounts[0]; // result로 본창에 전송(broker 삭제!)
                this.close();
              }
            }
          );
        } else {
          this.modal.openConfirm({
            title: '개인정보 수집 및 이용 동의 확인',
            message: `암웨이 코리아의 고객님<br>개인정보 수집 및 이용에 동의하시겠습니까?`,
            modalAddClass: 'pop_s',
            actionButtonLabel: '확인',
            closeButtonLabel: '취소',
            closeByClickOutside: false,
            closeByEnter: true,
            closeByEscape: true,
            modalId: ModalIds.AGREE,
            beforeCloseCallback : function () {
              if (this.isEnter) {
                this.result = this.isEnter;
              }
            }
          }).subscribe(
            result => {
              if (result) {
                this.createCustomerAccount();
              }
            }
          );
        }
      }, 100);
    }
  }

  /**
   * 신규 소비자 생성
   */
  private createCustomerAccount() {
    this.registerType = this.guser ? ConsumerRegister.EASY_PICKUP : ConsumerRegister.CONSUMER;
    this.createAccountSubscription = this.accountService.createNewAccount(this.registerType, this.phonetype, this.userPhone, this.sponsorNo).subscribe(
      userInfo => {
        if (userInfo) {
          this.account = userInfo;
          this.result = this.account.accounts[0]; // result로 본창에 전송(broker 삭제!)
          this.close();
        }
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('client.account.component', `create new customer error message : ${errdata.message}`).error();
          this.alert.error({ message: this.message.get('server.error', errdata.message) });
        }
      });
  }

  @HostListener('document:keydown.enter', ['$event', 'this.spinnerService.status()'])
  onCreateAccount(event: any, isSpinnerStatus: boolean) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT' && event.target.type.toUpperCase() === 'TEXT') { return; }
    if (!isSpinnerStatus) {
      const modals: string[] = this.storageService.getAllModalIds();
      if (modals && modals.length === 1 && event.target.id !== 'pos_layer_alert') {
        if (event.keyCode === KeyCode.ENTER) {
          this.saveNewCustomer(this.phoneNumText.nativeElement);
        }
      }
    }
  }

  close() {
    this.closeModal();
  }

}
