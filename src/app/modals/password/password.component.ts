import { Component, OnInit, Input } from '@angular/core';
import { ModalComponent } from '../../core/modal/modal.component';
import { ModalService, Modal, Logger } from '../../service/pos';

@Component({
  selector: 'pos-password',
  templateUrl: './password.component.html'
})
export class PasswordComponent extends ModalComponent implements OnInit {

  @Input() loginPassword: string;
  constructor(modalService: ModalService,
    private modal: Modal,
    private logger: Logger) {
    super(modalService);
  }

  ngOnInit() {
  }

  checkPassword() {

  }

  close() {
    this.modal.clearAllModals(this);
  }

}
