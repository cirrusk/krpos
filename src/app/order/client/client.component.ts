import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { StorageService, Modal } from '../../core';
import { NewAccountComponent } from '../../modals';

@Component({
  selector: 'pos-client',
  templateUrl: './client.component.html'
})
export class ClientComponent implements OnInit, OnDestroy {

  stsubscription: Subscription;
  public noticeList: string[] = [];
  constructor(private modal: Modal, private storage: StorageService) {
  }

  ngOnInit() {
    this.stsubscription = this.storage.storageChanges.subscribe(result => {
      if (result) {
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
