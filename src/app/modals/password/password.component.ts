import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent } from '../../core/modal/modal.component';
import { ModalService, Logger, StorageService } from '../../service/pos';
import { AuthService } from '../../service/auth.service';
import { AlertService } from '../../core/alert/alert.service';
import { AlertType } from '../../core/alert/alert-type.enum';
import Utils from '../../core/utils';

@Component({
  selector: 'pos-password',
  templateUrl: './password.component.html'
})
export class PasswordComponent extends ModalComponent implements OnInit, OnDestroy {

  @Input() loginPassword: string;
  authsubscription: Subscription;
  constructor(protected modalService: ModalService,
    private authService: AuthService,
    private storage: StorageService,
    private alert: AlertService,
    private logger: Logger) {
    super(modalService);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.authsubscription) { this.authsubscription.unsubscribe(); }
  }

  checkPassword() {

    const token = this.storage.getTokenInfo();
    const lognId = token && token.employeeId;
    const loginPwd = this.loginPassword;

    if (Utils.isEmpty(loginPwd)) {
      this.alert.show({
        alertType: AlertType.warn,
        title: '확인',
        message: '비밀번호가 공란입니다.'
      });
      return;
    }

    this.authsubscription = this.authService.authentication(lognId, loginPwd).subscribe(
    data => {
      this.result = true;
      this.modalResult();
    },
    error => {
      const errdata = Utils.getError(error);
      if (errdata) {
        this.logger.set({n: 'login.component', m: `authentication error type : ${errdata.type}`}).error();
        this.logger.set({n: 'login.component', m: `authentication error message : ${errdata.message}`}).error();
      }
    });

  }

  authUserCheck() {
    this.checkPassword();
  }

  close() {
    this.closeModal();
  }

}
