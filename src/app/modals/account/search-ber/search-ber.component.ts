import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core';

import { ModalComponent } from '../../../core/modal/modal.component';
import { ModalService } from '../../../service/pos';
import { Modal } from '../../../core/modal/modal';

@Component({
  selector: 'pos-search-ber',
  templateUrl: './search-ber.component.html'
})
export class SearchBerComponent extends ModalComponent implements OnInit, OnDestroy {
  // private listner: any;
  constructor(protected modalService: ModalService, private renderer: Renderer2) {
    super(modalService);
  }

  ngOnInit() {
    // this.listner = this.renderer.listen('window', 'keydown.esc', event => {
    //   this.close();
    // });
  }

  ngOnDestroy() {
    // this.listner(); // remove listener;
  }

  select() {

  }

  close() {
    this.closeModal();
  }
}
