import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ModalComponent, ModalService, Modal, AlertService, Logger } from '../../../../core';
import { MessageService } from '../../../../service';

@Component({
  selector: 'pos-signup-account',
  templateUrl: './signup-account.component.html'
})
export class SignupAccountComponent extends ModalComponent implements OnInit, OnDestroy {

  @ViewChild('inputSponsorABO') sponsorABONumber: ElementRef;
  // @ViewChild('inputUserName') userName: ElementRef;
  sponsorNumber: string;
  errorMessage: string;


  constructor(protected modalService: ModalService,
              private modal: Modal,
              private message: MessageService,
              private alert: AlertService,
              private logger: Logger) {
      super(modalService);
      this.sponsorNumber = '';
      this.errorMessage = '';
    }

    ngOnInit() {
      setTimeout(() => {
        this.sponsorABONumber.nativeElement.focus();
      }, 100);
    }

    ngOnDestroy() {
    }

    /**
     * 스폰서 ABO 번호 Validate
     * @param {string} sponsorABO 후원자 번호
     */
    checkSponsorABO(sponsorABO: string) {
      if (sponsorABO.length > 0) {
        // this.userName.nativeElement.focus();
        // this.userName.nativeElement.select();
        this.sponsorNumber = sponsorABO.trim();
        this.result = this.sponsorNumber;
        this.closeModal();
      } else {
        this.errorMessage = '바코드 후원자ABO번호를 입력해 주세요.';
        this.sponsorABONumber.nativeElement.focus();
      }
    }

    /**
     * 사용자이름 validate
     * @param {string} userName 사용자 이름
     */
    // checkUserName(userName: string) {
    //   this.checkSponsorABO(this.sponsorABONumber.nativeElement.value);
    //   if (userName.length > 0 && this.sponsorNumber !== '') {
    //     this.closeModal();
    //   } else {
    //     this.errorMessage = '가입신청자 한글성명을 입력해 주세요.';
    //     // this.userName.nativeElement.focus();
    //   }
    // }

    /**
     * 간편가입 진행
     */
    register() {
      this.checkSponsorABO(this.sponsorABONumber.nativeElement.value);
      // this.checkUserName(this.userName.nativeElement.value);
    }

    close() {
      this.result = '';
      this.closeModal();
    }
}
