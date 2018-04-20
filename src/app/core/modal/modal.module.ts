import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Modal } from './modal';
import { BasicModalComponent } from './basic-modal.component';
import { ModalHostComponent } from './modal-host.component';
import { ModalMainComponent } from './modal-main.component';

import { ModalService } from './modal.service';
import { FocusBlurDirective } from './focus-blur.directive';
import { OnlyNumberDirective } from '../common/only-number.directive';
import { throwIfAlreadyLoaded } from '../module-import-guard';
import { ModalComponent } from './modal.component';

@NgModule({
  declarations: [
    ModalComponent,
    ModalHostComponent,
    ModalMainComponent,
    BasicModalComponent,
    FocusBlurDirective,
    OnlyNumberDirective
  ],
  providers: [
    ModalService,
    Modal
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    FormsModule,
    ModalComponent,
    BasicModalComponent,
    FocusBlurDirective,
    OnlyNumberDirective
  ],
  entryComponents: [
    ModalHostComponent,
    ModalMainComponent,
    BasicModalComponent
  ]
})
export class ModalModule {
  constructor(@Optional() @SkipSelf() parentModule: ModalModule) {
    throwIfAlreadyLoaded(parentModule, 'ModalModule');
  }
}
