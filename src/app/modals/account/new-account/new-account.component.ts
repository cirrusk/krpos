import { Component, OnInit, OnDestroy, Input, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { ModalComponent, AlertService, ModalService, AlertType, OnlyNumberDirective, SpinnerService, Logger, Modal } from '../../../core';
import { AccountService } from './../../../service/account.service';
import { SearchAccountBroker } from '../../../broker';
import { Utils } from '../../../core/utils';
import { AccountList } from '../../../data';

@Component({
  selector: 'pos-new-account',
  templateUrl: './new-account.component.html'
})
export class NewAccountComponent extends ModalComponent implements OnInit, OnDestroy {

  private createAccountSubscription: Subscription;
  private registerType: string;
  private account: AccountList;
  @Input() userPhone: string;
  @Input() phonetype: string; // 휴대폰/전화번호 타입 선택
  @Input() agree: boolean;  // 개인정보수집 및 이용동의
  @Input() guser: boolean; // 간편선물 받은 사용자 여부
  @ViewChild('phoneNumText') private phoneNumText: ElementRef;
  phoneNumInput: FormControl = new FormControl('');
  private modalsubscription: Subscription;
  constructor(protected modalService: ModalService,
              private modal: Modal,
              private alert: AlertService,
              private accountService: AccountService,
              private spinner: SpinnerService,
              private searchAccountBroker: SearchAccountBroker,
              private logger: Logger,
              private renderer: Renderer2) {
    super(modalService);
    this.phonetype = 'MOBILE';
    this.agree = true;
    this.guser = false;
  }

  ngOnInit() {
    setTimeout(() => { this.phoneNumText.nativeElement.focus(); }, 100); // 모달 팝업 포커스 보다 timeout을 더주어야 focus 잃지 않음.
    const spcExp: RegExp = new RegExp(/[`~!@#$%^&*\\\'\";:\/()_+|<>?{}\[\]]]/g);
    const engExp: RegExp = new RegExp(/[a-z]/gi);
    const numExp: RegExp = new RegExp(/[0-9]/g);
    const numEngDelExp: RegExp = new RegExp(/[^0-9a-zA-Z]/g);
    this.phoneNumInput.valueChanges
    .debounceTime(300)
    .subscribe(v => {
      if (v) {
        if (!spcExp.test(v) || !engExp.test(v) || !numExp.test(v)) {
          this.phoneNumText.nativeElement.value = v.replace(numEngDelExp, '');
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.modalsubscription) { this.modalsubscription.unsubscribe(); }
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
    if (Utils.isEmpty(this.userPhone) || (this.userPhone.length < 9 && this.userPhone.length < 11)) {
      el.blur(); // 주의) 이렇게 처리해야만 alert 에서 이벤트 동작!
      this.alert.warn( {message: '입력 형식이 맞지 않습니다.'} );
      return;
    }
    console.log(`[1]phone type : ${this.phonetype}, user phone number : ${this.userPhone}, 개인정보 동의 : ${this.agree}, 간편선물 : ${this.guser}`);
    if (this.agree) {
      this.modalsubscription = this.modal.openConfirm(
        {
          title: '개인정보 수집 및 이용 동의 확인',
          message: `암웨이 코리아의 고객님<br>개인정보 수집 및 이용에 동의하시겠습니까?`,
          modalAddClass: 'pop_s',
          actionButtonLabel: '확인',
          closeButtonLabel: '취소',
          closeByClickOutside: false,
          modalId: 'AGREE'
        }
      ).subscribe(result => {
        if (result) {
          this.spinner.show();
          this.registerType = this.guser ? 'ECP' : 'CONSUMER';

          this.createAccountSubscription = this.accountService.createNewAccount(this.registerType, this.phonetype, this.userPhone).subscribe(
            userInfo => {
              if (userInfo) {
                this.account = userInfo;
                this.searchAccountBroker.sendInfo(this.account.accounts[0]);
                this.close();
              }
            },
            error => {
              this.spinner.hide();
              const errdata = Utils.getError(error);
              if (errdata) {
                this.logger.set('newAccount.component', `Save new customer error type : ${errdata.type}`).error();
                this.logger.set('newAccount.component', `Save new customer error message : ${errdata.message}`).error();
                this.alert.error({ message: `${errdata.message}` });
              }
            },
            () => { this.spinner.hide(); }
          );
          console.log('call new account register api...');
        }
      });
    }
  }

  close() {
     this.closeModal();
  }

}
