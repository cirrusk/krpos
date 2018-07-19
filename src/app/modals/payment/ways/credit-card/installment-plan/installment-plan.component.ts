import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { PaymentService } from '../../../../../service';
import { ModalComponent, ModalService, Logger, SpinnerService } from '../../../../../core';
import { Accounts, BankInfoList } from '../../../../../data';

@Component({
  selector: 'pos-installment-plan',
  templateUrl: './installment-plan.component.html'
})
export class InstallmentPlanComponent  extends ModalComponent implements OnInit, OnDestroy {

  private installmentPlanSubscription: Subscription;

  private accountInfo: Accounts;
  bankList: BankInfoList;

  constructor(protected modalService: ModalService,
              private paymentService: PaymentService,
              private logger: Logger,
              private spinner: SpinnerService) {
    super(modalService);
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.getInstallmentPlan();
  }

  ngOnDestroy() {
    if (this.installmentPlanSubscription) { this.installmentPlanSubscription.unsubscribe(); }
  }

  getInstallmentPlan() {
    this.spinner.show();
    this.installmentPlanSubscription = this.paymentService.getInstallmentPlan().subscribe(
      result => {
        if (result) {
          this.bankList = result;
        }
      },
      error => { this.spinner.hide(); this.logger.set('installment-plan.component', `${error}`).error(); },
      () => { this.spinner.hide(); }
    );
  }

  close() {
    this.closeModal();
  }

}
