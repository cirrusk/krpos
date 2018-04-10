import { Injectable } from '@angular/core';
import { without, find } from 'lodash';

@Injectable()
export class PosModalService {
  private modals: any[] = [];
  constructor() { }
  add(modal: any) {
    // add modal to array of active modals
    this.modals.push(modal);
}

remove(id: string) {
    // remove modal from array of active modals
    const modalToRemove = find(this.modals, { id: id });
    this.modals = without(this.modals, modalToRemove);
}

open(id: string) {
    // open modal specified by id
    const modal: any = find(this.modals, { id: id });
    modal.open();
}

close(id: string) {
    // close modal specified by id
    const modal: any = find(this.modals, { id: id });
    modal.close();
}
}
