import { Component, OnInit, HostListener } from '@angular/core';

import { ModalComponent, ModalService } from '../../../../core';

@Component({
  selector: 'pos-ic-card',
  templateUrl: './ic-card.component.html'
})
export class IcCardComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService) {
    super(modalService);
  }

  ngOnInit() {
  }

  close() {
    this.closeModal();
  }

  @HostListener('document: keydown', ['$event', '$event.target'])
  icCardAction(event: KeyboardEvent, targetElm: HTMLElement) {
    event.stopPropagation();
    if (event.keyCode === 13) {
      alert('enter event...');
    }
  }

}
