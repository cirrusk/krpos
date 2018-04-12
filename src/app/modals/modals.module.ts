import { ModalModule } from './../core/modal/modal.module';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LoginComponent } from './login/login.component';
import { PasswordComponent } from './password/password.component';
import { SearchProductComponent } from './product/search-product/search-product.component';
import { SearchAccountComponent } from './account/search-account/search-account.component';
import { NormalPaymentComponent } from './payment/normal-payment/normal-payment.component';
import { NewAccountComponent } from './account/new-account/new-account.component';

import { throwIfAlreadyLoaded } from '../core/module-import-guard';

@NgModule({
  declarations: [
    LoginComponent,
    PasswordComponent,
    SearchAccountComponent,
    SearchProductComponent,
    NewAccountComponent,
    NormalPaymentComponent
  ],
  imports: [
    CommonModule,
    ModalModule
  ],
  entryComponents: [
    LoginComponent,
    PasswordComponent,
    SearchAccountComponent,
    SearchProductComponent,
    NewAccountComponent,
    NormalPaymentComponent
  ]
})
export class ModalsModule {
  constructor(@Optional() @SkipSelf() parentModule: ModalsModule) {
    throwIfAlreadyLoaded(parentModule, 'ModalsModule');
  }
}
