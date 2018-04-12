import { OnlyNumberDirective } from './../common/only-number.directive';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Modal } from './modal';
import { BasicModalComponent } from './basic-modal.component';
import { ModalHostComponent } from './modal-host.component';
import { ModalMainComponent } from './modal-main.component';

import { LoginComponent } from '../../modals/login/login.component';
import { PasswordComponent } from '../../modals/password/password.component';
import { SearchAccountComponent } from '../../modals/account/search-account/search-account.component';
import { SearchProductComponent } from '../../modals/product/search-product/search-product.component';
import { NewCustomerComponent } from '../../modals/account/new-customer/new-customer.component';

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
    SearchAccountComponent,
    SearchProductComponent,
    NewCustomerComponent,
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
    BasicModalComponent,
    FocusBlurDirective,
    OnlyNumberDirective
  ],
  entryComponents: [
    ModalHostComponent,
    ModalMainComponent,
    BasicModalComponent,
    LoginComponent,
    PasswordComponent,
    SearchAccountComponent,
    SearchProductComponent,
    NewCustomerComponent
  ]
})
export class ModalModule {
  constructor(@Optional() @SkipSelf() parentModule: ModalModule) {
    throwIfAlreadyLoaded(parentModule, 'ModalModule');
  }
}
