import { AlertType } from './../../../core/alert/alert-type.enum';
import { AlertService } from './../../../core/alert/alert.service';
import { Component, OnInit } from '@angular/core';

import { ModalComponent } from '../../../core/modal/modal.component';
import { ModalService } from '../../../service/pos';
import { Modal } from '../../../core/modal/modal';

@Component({
  selector: 'pos-ecp-print',
  templateUrl: './ecp-print.component.html'
})
export class EcpPrintComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService, private alert: AlertService) {
    super(modalService);
  }

  print() {
    this.alert.show({
      alertType: AlertType.info,
      title: 'ECP 컨펌/출력',
      message: '픽업 주문 영수증 출력이 완료되었습니다.'
    });
  }

  ngOnInit() {
  }

  close() {
    this.closeModal();
  }

}
