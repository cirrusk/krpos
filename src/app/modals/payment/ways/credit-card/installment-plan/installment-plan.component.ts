import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalComponent, Modal, ModalService, Logger, SpinnerService } from '../../../../../core';
import { PaymentService } from '../../../../../service';
import { Accounts, BankInfo } from '../../../../../data';

@Component({
  selector: 'pos-installment-plan',
  templateUrl: './installment-plan.component.html'
})
export class InstallmentPlanComponent  extends ModalComponent implements OnInit, OnDestroy {

  private installmentPlanSubscription: Subscription;

  private accountInfo: Accounts;
  bankList: BankInfo;

  constructor(protected modalService: ModalService,
              private paymentService: PaymentService,
              private logger: Logger,
              private spinner: SpinnerService,
              private modal: Modal) {
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
    this.installmentPlanSubscription = this.paymentService.getInstallmentPlan('B', this.accountInfo.parties[0].uid).subscribe(
      result => {
        if (result) {
          this.bankList = result;
        }
      },
      error => { this.logger.set('installment-plan.component', `${error}`).error(); },
      () => { this.spinner.hide(); }
    );
  }

  close() {
    this.closeModal();
  }

}
