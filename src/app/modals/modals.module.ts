import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { throwIfAlreadyLoaded } from '../core/module-import-guard';
import { ModalModule } from '../core/modal/modal.module';
import { MaskPipe } from '../core/pipe/mask.pipe';

import { BatchComponent } from './login/batch.component';
import { CashComponent } from './payment/ways/cash/cash.component';
import { CashReceiptComponent } from './payment/ways/cash-receipt/cash-receipt.component';
import { CancelOrderComponent } from './order/cancel-order/cancel-order.component';
import { CancelCartComponent } from './cart/cancel-cart/cancel-cart.component';
import { ChecksComponent } from './payment/ways/checks/checks.component';
import { ClientAccountComponent } from './account/client-account/client-account.component';
import { CompletePaymentComponent } from './payment/complete-payment/complete-payment.component';
import { ComplexPaymentComponent } from './payment/complex-payment/complex-payment.component';
import { CouponComponent } from './payment/ways/coupon/coupon.component';
import { CreditCardComponent } from './payment/ways/credit-card/credit-card.component';
import { DirectDebitComponent } from './payment/ways/direct-debit/direct-debit.component';
import { EtcOrderComponent } from './order/etc-order/etc-order.component';
import { EcpPrintComponent } from './order/ecp-print/ecp-print.component';
import { EcpConfirmComponent } from './order/ecp-confirm/ecp-confirm.component';
import { HoldOrderComponent } from './order/hold-order/hold-order.component';
import { IcCardComponent } from './payment/ways/ic-card/ic-card.component';
import { InstallmentPlanComponent } from './payment/ways/credit-card/installment-plan/installment-plan.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { OrderDetailComponent } from './order/order-detail/order-detail.component';
import { PasswordComponent } from './password/password.component';
import { PickupOrderComponent } from './order/pickup-order/pickup-order.component';
import { PromotionOrderComponent } from './order/promotion-order/promotion-order.component';
import { PointComponent } from './payment/ways/point/point.component';
import { PhoneNumberMaskPipe } from '../core/pipe/phone-number-mask.pipe';
import { RestrictComponent } from './order/restrict/restrict.component';
import { ReCashComponent } from './payment/ways/re-cash/re-cash.component';
import { SearchAccountComponent } from './account/search-account/search-account.component';
import { SearchBerComponent } from './account/search-ber/search-ber.component';
import { SearchProductComponent } from './product/search-product/search-product.component';
import { SerialComponent } from './scan/serial/serial.component';
import { UpdateItemQtyComponent } from './cart/update-item-qty/update-item-qty.component';
import { CancelEcpPrintComponent } from './order/ecp-print/cancel-ecp-print/cancel-ecp-print.component';
import { SignupAccountComponent } from './account/client-account/signup-account/signup-account.component';
import { PromotionDetailComponent } from './order/promotion-detail/promotion-detail.component';

@NgModule({
  declarations: [
    BatchComponent,
    ChecksComponent,
    ComplexPaymentComponent,
    CouponComponent,
    CancelOrderComponent,
    CancelCartComponent,
    CreditCardComponent,
    CashComponent,
    CashReceiptComponent,
    ClientAccountComponent,
    CompletePaymentComponent,
    DirectDebitComponent,
    EcpConfirmComponent,
    EcpPrintComponent,
    EtcOrderComponent,
    HoldOrderComponent,
    IcCardComponent,
    InstallmentPlanComponent,
    LoginComponent,
    LogoutComponent,
    OrderDetailComponent,
    PasswordComponent,
    PickupOrderComponent,
    PointComponent,
    PhoneNumberMaskPipe,
    PromotionOrderComponent,
    ReCashComponent,
    RestrictComponent,
    SearchAccountComponent,
    SearchProductComponent,
    SearchBerComponent,
    SerialComponent,
    UpdateItemQtyComponent,
    MaskPipe,
    CancelEcpPrintComponent,
    SignupAccountComponent,
    PromotionDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    BatchComponent,
    CancelOrderComponent,
    CancelCartComponent,
    CashComponent,
    CashReceiptComponent,
    ClientAccountComponent,
    CompletePaymentComponent,
    ChecksComponent,
    ComplexPaymentComponent,
    CouponComponent,
    CreditCardComponent,
    DirectDebitComponent,
    EcpConfirmComponent,
    EtcOrderComponent,
    EcpPrintComponent,
    HoldOrderComponent,
    IcCardComponent,
    InstallmentPlanComponent,
    LoginComponent,
    LogoutComponent,
    OrderDetailComponent,
    PasswordComponent,
    PickupOrderComponent,
    PromotionOrderComponent,
    PointComponent,
    ReCashComponent,
    RestrictComponent,
    SearchAccountComponent,
    SearchProductComponent,
    SearchBerComponent,
    SerialComponent,
    UpdateItemQtyComponent,
    CancelEcpPrintComponent,
    SignupAccountComponent,
    PromotionDetailComponent
  ]
})
export class ModalsModule {
  constructor(@Optional() @SkipSelf() parentModule: ModalsModule) {
    throwIfAlreadyLoaded(parentModule, 'ModalsModule');
  }
}
