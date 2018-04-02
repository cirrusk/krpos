import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Modal } from './modal';
import { BasicModalComponent } from './basic-modal.component';
import { ModalHostComponent } from './modal-host.component';
import { ModalMainComponent } from './modal-main.component';
import { LoginComponent } from '../../modals/login/login.component';
import { PasswordComponent } from '../../modals/password/password.component';

import { ModalService } from './modal.service';
import { FocusBlurDirective } from './focus-blur.directive';
import { ModalCenterDirective } from './modal-center.directive';
import { SearchAccountComponent } from '../../modals/order/search-account/search-account.component';



@NgModule({
  declarations: [
    ModalHostComponent,
    ModalMainComponent,
    BasicModalComponent,
    LoginComponent,
    PasswordComponent,
    FocusBlurDirective,
    ModalCenterDirective,
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
    FocusBlurDirective,
    ModalCenterDirective
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
export class ModalModule { }
