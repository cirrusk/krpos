import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { StorageService, Modal, Logger } from '../../core';
import { NewAccountComponent } from '../../modals';
import { Accounts } from '../../data';

@Component({
  selector: 'pos-client',
  templateUrl: './client.component.html'
})
export class ClientComponent implements OnInit, OnDestroy {

  private stsubscription: Subscription;
  public noticeList: string[] = [];
  accountInfo: Accounts;                          // 사용자 정보
  constructor(private modal: Modal, private storage: StorageService, private logger: Logger) {
  }

  ngOnInit() {
    this.stsubscription = this.storage.storageChanges.subscribe(result => {
      if (result) {
        this.logger.set('client.component', `storage subscribe ... ${result.key}`).debug();
        if (result.key === 'nc') {
          if (result.value === 'Y') {
            this.modal.openModalByComponent(NewAccountComponent,
              {
                modalId: 'NewAccountComponent_CLIENT'
              }
            ).subscribe(data => {
              this.storage.removeLocalItem('nc');
            });
          }
        } else if (result.key === 'customer') {
          this.accountInfo = result.value;
        }
      }
    });
    this.loadNotice();
  }

  ngOnDestroy() {
    if (this.stsubscription) { this.stsubscription.unsubscribe(); }
  }

  private loadNotice() {
    this.noticeList.push('1. 주차권은 고객센터에서 수령하세요!');
    this.noticeList.push('2. 쿠폰은 계산전에 확인해주시기 바랍니다.');
    this.noticeList.push('3. 영수증은 꼭 받아가주시기 바랍니다.');
  }
}
