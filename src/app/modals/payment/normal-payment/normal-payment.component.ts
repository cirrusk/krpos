import { Component, OnInit, ViewChildren, ElementRef, QueryList, Renderer2 } from '@angular/core';
import { ModalComponent, ModalService, Modal, AlertService, StorageService, PrinterService } from '../../../core';

import { CreditCardComponent } from '../ways/credit-card/credit-card.component';
import { IcCardComponent } from '../ways/ic-card/ic-card.component';
import { CashComponent } from '../ways/cash/cash.component';
import { DirectDebitComponent } from '../ways/direct-debit/direct-debit.component';
import { ChecksComponent } from '../ways/checks/checks.component';
import { ReCashComponent } from '../ways/re-cash/re-cash.component';
import { CouponComponent } from '../ways/coupon/coupon.component';
import { PointComponent } from '../ways/point/point.component';
import { OrderEntry, Accounts } from '../../../data';
import { OrderInfoVO } from '../../../data/models/receipt/order.info';
import { BonusInfoVO } from '../../../data/models/receipt/bonus.info';
import { PaymentsVO } from '../../../data/models/receipt/payments';
import { PriceVO } from '../../../data/models/receipt/price';
import { ProductEntryVO } from '../../../data/models/receipt/product';
import { ReceiptVO } from '../../../data/models/receipt/receipt.vo';
import { ReceiptService } from '../../../service';
import { InfoBroker } from '../../../broker';

@Component({
  selector: 'pos-normal-payment',
  templateUrl: './normal-payment.component.html'
})
export class NormalPaymentComponent extends ModalComponent implements OnInit {
  @ViewChildren('paytypes') paytypes: QueryList<ElementRef>;

  private cartList: Array<OrderEntry>;
  private accountInfo: Accounts;
  constructor(protected modalService: ModalService,
              private alertService: AlertService,
              private storageService: StorageService,
              private receiptService: ReceiptService,
              private printerService: PrinterService,
              private modal: Modal,
              private info: InfoBroker,
              private renderer: Renderer2) {
    super(modalService);
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartList = this.callerData.cartList;
  }

  creditCard(evt: any) {
    // this.modal.clearAllModals(this.modal.getModalArray()[0]); // 앞서 열려있던 창 닫기
    this.setSelected(evt);
    // this.modal.openModalByComponent(CreditCardComponent,
    //   {
    //     title: '',
    //     actionButtonLabel: '',
    //     closeButtonLabel: '',
    //     closeByClickOutside: false,
    //     modalId: 'CreditCardComponent'
    //   }
    // );
    this.makeReceipt(this.accountInfo, this.cartList);
  }

  icCard(evt: any) {
    this.setSelected(evt);
    this.modal.openModalByComponent(IcCardComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        modalId: 'IcCardComponent'
      }
    );
  }

  amwayPoint(evt: any) {
    this.setSelected(evt);
    this.modal.openModalByComponent(PointComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        modalId: 'IcCardComponent_Amway',
        pointType: 'a'
      }
    );
  }

  memberPoint(evt: any) {
    this.setSelected(evt);
    this.modal.openModalByComponent(PointComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        modalId: 'IcCardComponent_Member',
        pointType: 'm'
      }
    );
  }

  cashPayment(evt: any) {
    this.setSelected(evt);
    this.modal.openModalByComponent(CashComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        modalId: 'CashComponent'
      }
    );
  }

  directDebitPayment(evt: any) {
    this.setSelected(evt);
    this.modal.openModalByComponent(DirectDebitComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        modalId: 'DirectDebitComponent'
      }
    );
  }

  checkPayment(evt: any) {
    this.setSelected(evt);
    this.modal.openModalByComponent(CashComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        modalId: 'CashComponent'
      }
    );
  }

  reCashPayment(evt: any) {
    this.setSelected(evt);
    this.modal.openModalByComponent(ReCashComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        modalId: 'ReCashComponent'
      }
    );
  }

  couponPayment(evt: any) {
    this.setSelected(evt);
    this.modal.openModalByComponent(CouponComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByClickOutside: false,
        modalId: 'CouponComponent'
      }
    );
  }

  close() {
    this.closeModal();
  }

  private setSelected(evt: any) {
    evt.stopPropagation();
    this.paytypes.forEach(paytype => {
      parent = this.renderer.parentNode(paytype.nativeElement);
      this.renderer.removeClass(parent, 'on');
      this.renderer.removeClass(paytype.nativeElement, 'on');
    });
    parent = this.renderer.parentNode(evt.target);
    this.renderer.addClass(parent, 'on');
    this.renderer.addClass(evt.target, 'on');
  }

  /**
   * 영수증 출력 임시 생성
   * @param accountInfo
   * @param cartList
   */
  private makeReceipt(accountInfo: Accounts, cartList: Array<OrderEntry>): void {
    const posId = this.storageService.getTerminalInfo().id;
    const tokenInfo = this.storageService.getTokenInfo();
    const productEntryList = new Array<ProductEntryVO>();

    const orderInfo = new OrderInfoVO(posId, tokenInfo.employeeId, tokenInfo.employeeName, accountInfo.parties[0].uid, accountInfo.parties[0].name);
    const productList = Array<any>();
    let totalPV = 0;
    let totalBV = 0;
    let totalPrice = 0;
    let totalQty = 0;
    this.cartList.forEach(entry => {
      productList.push({'idx': entry.entryNumber,
                        'skuCode': entry.product.code,
                        'productName': entry.product.name,
                        'price': entry.product.price.value.toString(),
                        'qty': entry.quantity.toString(),
                        'totalPrice': entry.totalPrice.value.toString()});
      if (entry.totalPrice.amwayValue) {
        totalPV += entry.totalPrice.amwayValue.pointValue;
        totalBV += entry.totalPrice.amwayValue.businessVolume;
      }
      totalPrice += entry.totalPrice.value;
      totalQty += entry.quantity;
    });
    const bonus = new BonusInfoVO(totalPV, totalBV);
    const payments = new PaymentsVO(totalPrice);
    const price = new PriceVO(totalQty, totalPrice);
    const jsonData = productList;
    Object.assign(productEntryList, jsonData);

    const receitVo = new ReceiptVO(orderInfo, bonus, payments, price, productEntryList);

    const text = this.receiptService.aboNormal(receitVo);
    try {
      this.printerService.printText(text);
      this.info.sendInfo('orderClear', 'clear');
      this.alertService.info({message: '주문이 완료되었습니다.'});
      this.close();
    } catch (e) {
      console.log(text);
      this.alertService.info({message: '주문이 실패되었습니다.'});
    }
  }
}
