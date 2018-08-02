import { Component, OnInit } from '@angular/core';
import { ModalComponent, ModalService, Modal, AlertService, AlertType } from '../../../core';

@Component({
  selector: 'pos-ecp-print',
  templateUrl: './ecp-print.component.html'
})
export class EcpPrintComponent extends ModalComponent implements OnInit {
  message: string;
  constructor(protected modalService: ModalService, private alert: AlertService) {
    super(modalService);
  }

  /**
   * 출력 완료 Alert
   */
  print() {
    this.alert.info({title: 'ECP 컨펌/출력', message: '픽업 주문 영수증 출력이 완료되었습니다.'});
  }

  ngOnInit() {
  }

  close() {
    this.closeModal();
  }

}
