import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ModalComponent, ModalService, Modal, AlertService, Logger } from '../../../../core';
import { MessageService, AccountService } from '../../../../service';
import { ModalIds, ConsumerRegister, AccountList } from '../../../../data';
import { Subscription } from 'rxjs/Subscription';
import { Utils } from '../../../../core/utils';

/**
 * 비회원 간편선물 가입 시 스폰서 ABO 정보 입력 팝업
 */
@Component({
  selector: 'pos-signup-account',
  templateUrl: './signup-account.component.html'
})
export class SignupAccountComponent extends ModalComponent implements OnInit, OnDestroy {

  @ViewChild('inputSponsorABO') sponsorABONumber: ElementRef;
  private createAccountSubscription: Subscription;
  private account: AccountList;
  private phonetype: string;
  private userPhone: string;
  sponsorNumber: string;
  errorMessage: string;

  constructor(protected modalService: ModalService,
              private modal: Modal,
              private message: MessageService,
              private alert: AlertService,
              private accountService: AccountService,
              private logger: Logger) {
      super(modalService);
      this.sponsorNumber = '';
      this.errorMessage = '';
    }

    ngOnInit() {
      this.phonetype = this.callerData.phonetype;
      this.userPhone = this.callerData.userPhone,
      setTimeout(() => { this.sponsorABONumber.nativeElement.focus(); }, 100);
    }

    ngOnDestroy() {
      if (this.createAccountSubscription) { this.createAccountSubscription.unsubscribe(); }
    }

    /**
     * 스폰서 ABO 번호 Validate
     * @param {string} sponsorABO 후원자 번호
     */
    checkSponsorABO(sponsorABO: string) {
      if (sponsorABO && sponsorABO.trim().length > 0) {
        this.sponsorNumber = sponsorABO.trim();
        setTimeout(() => {
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
                this.createCustomerAccount(this.sponsorNumber);
              }
            }
          );
        }, 100);
      } else {
        this.errorMessage = '바코드 후원자ABO번호를 입력해 주세요.';
        this.sponsorABONumber.nativeElement.focus();
      }
    }

    /**
     * 간편가입 진행
     */
    register() {
      this.checkSponsorABO(this.sponsorABONumber.nativeElement.value);
    }

    /**
   * 신규 소비자 생성
   *  - 팝업창에서 Error message 노출로 인하여 가입창에서도 별도 생성
   */
  private createCustomerAccount(sponsorNumber: string) {
    const registerType = ConsumerRegister.EASY_PICKUP;
    this.createAccountSubscription = this.accountService.createNewAccount(registerType, this.phonetype, this.userPhone, sponsorNumber).subscribe(
      userInfo => {
        if (userInfo) {
          this.result = userInfo;
          this.closeModal();
        }
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('client.account.component', `create new customer error message : ${errdata.message}`).error();
          // if (errdata.message.indexOf('Please enter a valid Sponsor') > -1) {
          //   this.errorMessage = '등록된 후원자와 일치하는 번호가 없습니다. 확인 후 다시 입력해주세요.';
          // } else {
            this.errorMessage = errdata.message ? errdata.message : '오류가 발생하였습니다. 관리자에게 문의하시기 바랍니다.';
          // }
        }
      });
  }

    close() {
      this.result = '';
      this.closeModal();
    }
}
