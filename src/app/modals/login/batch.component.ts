import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalComponent, ModalService } from '../../core';

@Component({
  selector: 'pos-batch',
  templateUrl: './batch.component.html'
})
export class BatchComponent extends ModalComponent implements OnInit, OnDestroy {

  constructor(protected modalService: ModalService) {
    super(modalService);
  }

  ngOnInit() {
  }

  ngOnDestroy() {

  }

  endbatch() {
    this.close();
  }

  close() {
    this.closeModal();
  }

}
