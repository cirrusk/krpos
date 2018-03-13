import { without, find } from 'lodash';

import { Injectable } from '@angular/core';
/**
 * Origin source code :
 * @see http://jasonwatmore.com/post/2017/01/24/angular-2-custom-modal-window-dialog-box
*/
@Injectable()
export class ModalService {
    private modals: any[] = [];

    add(modal: any) {
        // add modal to array of active modals
        this.modals.push(modal);
    }

    remove(id: string) {
        // remove modal from array of active modals
        let modalToRemove = find(this.modals, { id: id });
        this.modals = without(this.modals, modalToRemove);
    }

    open(id: string) {
        // open modal specified by id
        let modal: any = find(this.modals, { id: id });
        modal.open();
    }

    close(id: string) {
        // close modal specified by id
        let modal: any = find(this.modals, { id: id });
        modal.close();
    }
}