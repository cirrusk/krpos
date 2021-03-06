import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService, Logger, Modal, StorageService } from '../../core';
import { BatchService, ReceiptService } from '../../service';
import { ModalIds, EodData } from '../../data';

/**
 * 로그아웃 팝업 화면
 */
@Component({
  selector: 'pos-logout',
  templateUrl: './logout.component.html'
})
export class LogoutComponent extends ModalComponent implements OnInit, OnDestroy {

  private statssubscription: Subscription;
  private batchsubscription: Subscription;
  private modalsubscription: Subscription;
  private eodsubscription: Subscription;
  private orderCount: number;
  constructor(protected modalService: ModalService,
    private modal: Modal,
    private storage: StorageService,
    private batch: BatchService,
    private receipt: ReceiptService,
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
    this.receipt.dispose();
    if (this.batchsubscription) { this.batchsubscription.unsubscribe(); }
    if (this.statssubscription) { this.statssubscription.unsubscribe(); }
    if (this.modalsubscription) { this.modalsubscription.unsubscribe(); }
    if (this.eodsubscription) { this.eodsubscription.unsubscribe(); }
  }

  /**
   * 근무 종료 상단 클릭 시 팝업
   *
   * 종료시 주문 건수가 1건 이상 있으면 해당 메시지로 변경해야함.
   * 1. POS 종료 확인 팝업
   *
   */
  logout() {
    if (this.storage.getBatchInfo() == null) { // Start Shift를 하지 않았으면
      this.logger.set('logout.component', 'not stat shift, only logout...').debug();
      this.storage.logout();
      // this.storage.removeEmployeeName(); // client 담당자 삭제
      this.storage.clearClient();
      this.result = true;
      this.modalResult();
    } else { // Start Shift를 했을 경우
      let posmsg = '';
      if (this.orderCount > 0) {
        posmsg = `주문 수량이 (<em class="fc_red">${this.orderCount}</em>)건 입니다.<br>배치 정보를 저장하시겠습니까?`;
      } else {
        posmsg = `근무 종료하시겠습니까?<br>배치정보 저장 후, 근무 종료가 진행됩니다.`;
      }
      this.result = true;
      this.modalResult();
      this.modal.openConfirm({
        title: '근무 종료',
        message: posmsg,
        actionButtonLabel: '계속',
        closeButtonLabel: '취소',
        modalId: ModalIds.ENDWORK
      }).subscribe(
        result => {
          if (result) {
            this.logger.set('logout.component', 'end work, stop batch...').debug();
            this.batchsubscription = this.batch.endBatch().subscribe(() => {
              // EOD 영수증 출력
              this.eodsubscription = this.batch.getEodData().subscribe(result => {
                const eodData: EodData = this.batch.convertEodData(result);
                this.receipt.printEod(eodData);
                this.logoutConfirm();
              }, error => {
                this.logoutConfirm();
              });

            });
          }
        }
      );
    }
  }

  private logoutConfirm() {
    this.storage.logout();
    // this.storage.removeEmployeeName(); // client 담당자 삭제
    this.storage.clearClient();
    this.modal.openConfirm({
      title: '근무 종료',
      message: `배치 정보 저장이 완료되었습니다.`,
      actionButtonLabel: '확인',
      closeButtonLabel: '취소',
      closeByClickOutside: false,
      modalId: ModalIds.ENDWORKLAST
    });
  }

  close() {
    this.closeModal();
  }

}
