import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { PaymentService } from '../../../../../service';
import { ModalComponent, ModalService, Logger } from '../../../../../core';
import { Accounts, BankInfoList } from '../../../../../data';

@Component({
  selector: 'pos-installment-plan',
  templateUrl: './installment-plan.component.html'
})
export class InstallmentPlanComponent extends ModalComponent implements OnInit, OnDestroy {

  private installmentPlanSubscription: Subscription;

  private accountInfo: Accounts;
  bankList: BankInfoList;

  constructor(protected modalService: ModalService,
    private paymentService: PaymentService,
    private logger: Logger) {
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
    this.installmentPlanSubscription = this.paymentService.getInstallmentPlan().subscribe(
      result => {
        if (result) {
          this.bankList = result;
        }
      },
      error => { this.logger.set('installment-plan.component', `${error}`).error(); });
  }

  close() {
    this.closeModal();
  }

}
