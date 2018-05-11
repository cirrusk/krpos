import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ModalModule } from './../core/modal/modal.module';
import { throwIfAlreadyLoaded } from '../core/module-import-guard';

import { SearchAccountComponent } from './account/search-account/search-account.component';
import { NewAccountComponent } from './account/new-account/new-account.component';
import { SearchBerComponent } from './account/search-ber/search-ber.component';
import { LoginComponent } from './login/login.component';
import { BatchComponent } from './login/batch.component';
import { LogoutComponent } from './logout/logout.component';
import { PasswordComponent } from './password/password.component';
import { PickupOrderComponent } from './order/pickup-order/pickup-order.component';
import { EtcOrderComponent } from './order/etc-order/etc-order.component';
import { PromotionOrderComponent } from './order/promotion-order/promotion-order.component';
import { EcpPrintComponent } from './order/ecp-print/ecp-print.component';
import { HoldOrderComponent } from './order/hold-order/hold-order.component';
import { RestrictComponent } from './order/restrict/restrict.component';
import { CancelOrderComponent } from './order/cancel-order/cancel-order.component';
import { SearchProductComponent } from './product/search-product/search-product.component';
import { NormalPaymentComponent } from './payment/normal-payment/normal-payment.component';
import { CouponPaymentComponent } from './payment/coupon-payment/coupon-payment.component';
import { ComplexPaymentComponent } from './payment/complex-payment/complex-payment.component';
import { CreditCardComponent } from './payment/ways/credit-card/credit-card.component';
import { CheckCardComponent } from './payment/ways/check-card/check-card.component';
import { IcCardComponent } from './payment/ways/ic-card/ic-card.component';
import { CashComponent } from './payment/ways/cash/cash.component';
import { DirectDebitComponent } from './payment/ways/direct-debit/direct-debit.component';
import { ReCashComponent } from './payment/ways/re-cash/re-cash.component';
import { ChecksComponent } from './payment/ways/checks/checks.component';
import { PointComponent } from './payment/ways/point/point.component';
import { CouponComponent } from './payment/ways/coupon/coupon.component';
import { PhoneNumberMaskPipe } from '../core/pipe/phone-number-mask.pipe';

@NgModule({
  declarations: [
    LoginComponent,
    PasswordComponent,
    SearchAccountComponent,
    SearchProductComponent,
    NewAccountComponent,
    NormalPaymentComponent,
    ComplexPaymentComponent,
    CouponPaymentComponent,
    PickupOrderComponent,
    EtcOrderComponent,
    PromotionOrderComponent,
    SearchBerComponent,
    EcpPrintComponent,
    HoldOrderComponent,
    LogoutComponent,
    CreditCardComponent,
    CheckCardComponent,
    IcCardComponent,
    CashComponent,
    DirectDebitComponent,
    ReCashComponent,
    ChecksComponent,
    PointComponent,
    CouponComponent,
    CancelOrderComponent,
    PhoneNumberMaskPipe,
    BatchComponent,
    RestrictComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    LoginComponent,
    PasswordComponent,
    SearchAccountComponent,
    SearchProductComponent,
    NewAccountComponent,
    NormalPaymentComponent,
    ComplexPaymentComponent,
    CouponPaymentComponent,
    PickupOrderComponent,
    EtcOrderComponent,
    PromotionOrderComponent,
    SearchBerComponent,
    EcpPrintComponent,
    HoldOrderComponent,
    LogoutComponent,
    CreditCardComponent,
    CheckCardComponent,
    IcCardComponent,
    CashComponent,
    DirectDebitComponent,
    ReCashComponent,
    ChecksComponent,
    PointComponent,
    CouponComponent,
    CancelOrderComponent,
    BatchComponent,
    RestrictComponent
  ]
})
export class ModalsModule {
  constructor(@Optional() @SkipSelf() parentModule: ModalsModule) {
    throwIfAlreadyLoaded(parentModule, 'ModalsModule');
  }
}
