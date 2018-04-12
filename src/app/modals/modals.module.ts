import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ModalModule } from './../core/modal/modal.module';
import { throwIfAlreadyLoaded } from '../core/module-import-guard';

import { LoginComponent } from './login/login.component';
import { PasswordComponent } from './password/password.component';
import { SearchProductComponent } from './product/search-product/search-product.component';
import { SearchAccountComponent } from './account/search-account/search-account.component';
import { NormalPaymentComponent } from './payment/normal-payment/normal-payment.component';
import { NewAccountComponent } from './account/new-account/new-account.component';
import { ComplexPaymentComponent } from './payment/complex-payment/complex-payment.component';
import { PickupOrderComponent } from './order/pickup-order/pickup-order.component';

@NgModule({
  declarations: [
    LoginComponent,
    PasswordComponent,
    SearchAccountComponent,
    SearchProductComponent,
    NewAccountComponent,
    NormalPaymentComponent,
    ComplexPaymentComponent,
    PickupOrderComponent
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
    NormalPaymentComponent,
    ComplexPaymentComponent,
    PickupOrderComponent
  ]
})
export class ModalsModule {
  constructor(@Optional() @SkipSelf() parentModule: ModalsModule) {
    throwIfAlreadyLoaded(parentModule, 'ModalsModule');
  }
}
