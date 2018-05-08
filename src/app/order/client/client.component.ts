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
    this.noticeList.push('1. 주차권을 뽑아가 주세요.');
    this.noticeList.push('2. 쿠폰을 뽑아가 주세요.');
    this.noticeList.push('3. 영수증을 뽑아가 주세요.');
  }
}
