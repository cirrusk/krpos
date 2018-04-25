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

  statssubscription: Subscription;
  batchsubscription: Subscription;
  modalsubscription: Subscription;
  private orderCount: number;
  constructor(protected modalService: ModalService,
    private modal: Modal,
    private router: Router,
    private storage: StorageService,
    private spinner: SpinnerService,
    private batch: BatchService,
    private infobroker: InfoBroker,
    private logger: Logger) {
    super(modalService);
    this.orderCount = 0;
  }

  ngOnInit() {
    this.statssubscription = this.batch.statsBatch().subscribe(result => {
      if (result) {
        this.orderCount = result.ordersCount;
        this.logger.set('logout.component', `current order count : ${this.orderCount}`).debug();
      }
    });
  }

  ngOnDestroy() {
    if (this.batchsubscription) { this.batchsubscription.unsubscribe(); }
    if (this.statssubscription) { this.statssubscription.unsubscribe(); }
    if (this.modalsubscription) { this.modalsubscription.unsubscribe(); }
  }

  /**
   * 근무 종료 상단 클릭 시 팝업
   * 종료시 주문 건수가 1건 이상 있으면 해당 메시지로 변경해야함.
   * 1. POS 종료 확인 팝업
   *
   */
  logout() {
    this.modal.clearAllModals(this.modal.getModalArray()[0]);
    if (this.storage.getBatchInfo() == null) { // Start Shift를 하지 않았으면
      this.logger.set('logout.component', 'not stat shift, only logout...').debug();
      this.storage.logout();
      this.storage.removeEmployeeName(); // client 담당자 삭제
    } else { // Start Shift를 했을 경우
      let posmsg = '';
      if (this.orderCount > 0) {
        posmsg = `주문 수량이 (<em class="fc_red">${this.orderCount}</em>)건 입니다.<br>배치 정보를 저장하시겠습니까?`;
      } else {
        posmsg = `근무 종료하시겠습니까?<br>배치정보 저장 후, 근무 종료가 진행됩니다.`;
      }
      this.modalsubscription = this.modal.openConfirm(
        {
          title: '근무 종료',
          message: posmsg,
          actionButtonLabel: '계속',
          closeButtonLabel: '취소',
          modalId: 'ENDWORK'
        }
      ).subscribe(
        result => {
          if (result) {
            this.spinner.show();
            this.logger.set('logout.component', 'end work, stop batch...').debug();
            this.batchsubscription = this.batch.endBatch().subscribe(data => {
              this.storage.logout();
              this.storage.removeEmployeeName(); // client 담당자 삭제
              this.modal.openConfirm({
                title: '근무 종료',
                message: `배치 정보 저장이 완료되었습니다.`,
                actionButtonLabel: '확인',
                closeButtonLabel: '취소',
                closeByClickOutside: false,
                modalId: 'ENDWORK_LAST'
              });
            },
            (error) => {},
            () => { this.spinner.hide(); });
          } else {
            this.router.navigate(['/order']);
          }
        }
      );
    }
  }

  close() {
    this.closeModal();
  }

}
