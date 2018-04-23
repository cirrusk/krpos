import { Subscription } from 'rxjs/Subscription';
import { Modal } from './../../core/modal/modal';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalComponent } from '../../core/modal/modal.component';
import { ModalService, Logger, StorageService } from '../../service/pos';
import { BatchService } from '../../service/batch.service';
import { InfoBroker } from '../../broker/info.broker';
import { SpinnerService } from '../../core/spinner/spinner.service';
import { Router } from '@angular/router';
import Utils from '../../core/utils';

@Component({
  selector: 'pos-logout',
  templateUrl: './logout.component.html'
})
export class LogoutComponent extends ModalComponent implements OnInit, OnDestroy {

  batchsubscription: Subscription;
  constructor(protected modalService: ModalService,
    private modal: Modal,
    private router: Router,
    private storage: StorageService,
    private spinner: SpinnerService,
    private batch: BatchService,
    private infobroker: InfoBroker,
    private logger: Logger) {
    super(modalService);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.batchsubscription) { this.batchsubscription.unsubscribe(); }
  }

  /**
   * 근무 종료 상단 클릭 시 팝업
   * 1. POS 종료 확인 팝업
   *
   */
  logout() {
    this.modal.clearAllModals(this.modal.getModalArray()[0]);
    if (this.storage.getBatchInfo() == null) { // Start Shift를 하지 않았으면
      this.logger.set({n: 'logout.component', m: 'not stat shift, only logout...'}).debug();
      this.storage.logout();
      this.storage.removeEmployeeName(); // client 담당자 삭제
    } else { // Start Shift를 했을 경우
      this.modal.openConfirm(
        {
          title: 'POS 종료',
          message: `POS를 종료하시겠습니까?<br>배치정보 저장 후, 화면 종료가 진행됩니다.`,
          actionButtonLabel: '계속',
          closeButtonLabel: '취소',
          closeByEnter: false,
          closeByEscape: true,
          closeByClickOutside: true,
          closeAllModals: false,
          modalId: 'LOGOUT'
        }
      ).subscribe(
        result => {
          if (result) {
            this.spinner.show();
            this.logger.set({n: 'logout.component', m: 'started batch already, stop batch...'}).debug();
            this.batchsubscription = this.batch.endBatch().subscribe(data => {
              this.logger.set({n: 'logout.component', m: `end batch info : ${Utils.stringify(data)}`}).debug();
              this.storage.logout();
              this.storage.removeEmployeeName(); // client 담당자 삭제
              this.modal.openConfirm({
                title: 'POS 종료',
                message: `배치 정보 저장이 완료되었습니다.`,
                actionButtonLabel: '확인',
                closeButtonLabel: '취소',
                closeByEnter: false,
                closeByEscape: true,
                closeByClickOutside: false,
                closeAllModals: false,
                modalId: 'LOGOUT_LAST'
              }).subscribe((res) => {
                if (res) {
                  this.router.navigate(['/dashboard']);
                } else {
                  this.router.navigate(['/dashboard']);
                }
              });
            },
            (error) => {},
            () => { this.spinner.hide(); });
          }
        }
      );
    }
  }

  close() {
    this.closeModal();
  }

}
