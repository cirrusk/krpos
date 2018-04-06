import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Modal } from './modal';
import { BasicModalComponent } from './basic-modal.component';
import { ModalHostComponent } from './modal-host.component';
import { ModalMainComponent } from './modal-main.component';

import { LoginComponent } from '../../modals/login/login.component';
import { PasswordComponent } from '../../modals/password/password.component';
import { SearchAccountComponent } from '../../modals/order/search-account/search-account.component';

import { ModalService } from './modal.service';
import { FocusBlurDirective } from './focus-blur.directive';

import { throwIfAlreadyLoaded } from '../module-import-guard';

@NgModule({
  declarations: [
    ModalHostComponent,
    ModalMainComponent,
    BasicModalComponent,
    LoginComponent,
    PasswordComponent,
    FocusBlurDirective,
    SearchAccountComponent
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
    BasicModalComponent,
    FocusBlurDirective
  ],
  entryComponents: [
    ModalHostComponent,
    ModalMainComponent,
    BasicModalComponent,
    LoginComponent,
    PasswordComponent,
    SearchAccountComponent
  ]
})
export class ModalModule {
  constructor(@Optional() @SkipSelf() parentModule: ModalModule) {
    throwIfAlreadyLoaded(parentModule, 'ModalModule');
  }
}
