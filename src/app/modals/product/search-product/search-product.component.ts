import { Component, OnInit, OnDestroy } from '@angular/core';

import { ModalComponent } from '../../../core/modal/modal.component';
import { ModalService } from '../../../service/pos';
import { Modal } from '../../../core/modal/modal';

@Component({
  selector: 'pos-search-product',
  templateUrl: './search-product.component.html'
})
export class SearchProductComponent extends ModalComponent implements OnInit {

  constructor(modalService: ModalService) {
    super(modalService);
  }

  ngOnInit() {
  }

  prev() {

  }

  next() {

  }

  productSelect() {

  }

  close() {
    this.closeModal();
  }

}
