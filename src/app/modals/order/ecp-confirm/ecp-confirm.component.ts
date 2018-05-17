import { Component, OnInit } from '@angular/core';
import { ModalComponent, ModalService, AlertService, Modal } from '../../../core';

@Component({
  selector: 'pos-ecp-confirm',
  templateUrl: './ecp-confirm.component.html'
})
export class EcpConfirmComponent extends ModalComponent implements OnInit {

  constructor(private modal: Modal,
              protected modalService: ModalService,
              private alert: AlertService) {
    super(modalService);
  }

  ngOnInit() {
  }

  confirm() {
    // 완료 여부 확인

    // 이상이 있을 경우 메시지 전시
    if (true) {
      this.modal.openConfirm(
        {
          title: 'ECP 컨펌',
          message: '<p class="txt_info02 type02">120351K  글리스터 리후레셔 스프레이 수량이 <em class="fc_red">(0)</em>개<br>' +
                   '<em class="fc_red">(1)</em>개 수량이 더 필요합니다.</p> <span class="blck">해당 상품을 바코드로 스캔하세요!</span>',
          actionButtonLabel: '확인',
          closeButtonLabel: '취소',
          closeByClickOutside: false,
          modalId: 'ECPCONFIRM'
        }
      );
    }
  }
  close() {
    this.closeModal();
  }

}
