import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { StorageService, Modal } from '../core';
import { NewAccountComponent } from '../modals';

@Component({
  selector: 'pos-client',
  templateUrl: './client.component.html'
})
export class ClientComponent implements OnInit, OnDestroy {

  stsubscription: Subscription;
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
  }

  ngOnDestroy() {
    if (this.stsubscription) { this.stsubscription.unsubscribe(); }
  }


}
