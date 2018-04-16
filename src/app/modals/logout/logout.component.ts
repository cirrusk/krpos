import { Subscription } from 'rxjs/Subscription';
import { Modal } from './../../core/modal/modal';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalComponent } from '../../core/modal/modal.component';
import { ModalService, Logger, StorageService } from '../../service/pos';
import { BatchService } from '../../service/batch.service';
import { InfoBroker } from '../../broker/info.broker';

@Component({
  selector: 'pos-logout',
  templateUrl: './logout.component.html'
})
export class LogoutComponent extends ModalComponent implements OnInit, OnDestroy {

  batchsubscription: Subscription;
  constructor(protected modalService: ModalService,
    private modal: Modal,
    private storage: StorageService,
    private batch: BatchService,
    private infobroker: InfoBroker) {
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
  private logout() {
    this.modal.clearAllModals(this.modal.getModalArray()[0]);
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
          console.log('stop batch................');
          this.batchsubscription = this.batch.endBatch().subscribe(data => {
            this.storage.removeTokenInfo(); // remove access token info
            this.infobroker.sendInfo(null); // info broker에 null access token을 전송해서 초기 상태로 변경.
          },
          (error) => {});
        }
      }
    );



    // this.storage.removeTokenInfo();
    // this.infobroker.sendInfo(null);
    // this.close();
  }

  private close() {
    this.closeModal();
  }

}
