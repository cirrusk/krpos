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
import { EtcOrderComponent } from './order/etc-order/etc-order.component';
import { PromotionOrderComponent } from './order/promotion-order/promotion-order.component';
import { SearchBerComponent } from './account/search-ber/search-ber.component';
import { EcpPrintComponent } from './order/ecp-print/ecp-print.component';
import { HoldOrderComponent } from './order/hold-order/hold-order.component';
import { LogoutComponent } from './logout/logout.component';

@NgModule({
  declarations: [
    LoginComponent,
    PasswordComponent,
    SearchAccountComponent,
    SearchProductComponent,
    NewAccountComponent,
    NormalPaymentComponent,
    ComplexPaymentComponent,
    PickupOrderComponent,
    EtcOrderComponent,
    PromotionOrderComponent,
    SearchBerComponent,
    EcpPrintComponent,
    HoldOrderComponent,
    LogoutComponent
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
    PickupOrderComponent,
    EtcOrderComponent,
    PromotionOrderComponent,
    SearchBerComponent,
    EcpPrintComponent,
    HoldOrderComponent,
    LogoutComponent
  ]
})
export class ModalsModule {
  constructor(@Optional() @SkipSelf() parentModule: ModalsModule) {
    throwIfAlreadyLoaded(parentModule, 'ModalsModule');
  }
}
