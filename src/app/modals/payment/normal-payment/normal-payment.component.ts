import { Component, OnInit, ViewChildren, ElementRef, QueryList, Renderer2, OnDestroy } from '@angular/core';
import { ModalComponent, ModalService, Modal, AlertService, StorageService, PrinterService } from '../../../core';

import { CreditCardComponent } from '../ways/credit-card/credit-card.component';
import { IcCardComponent } from '../ways/ic-card/ic-card.component';
import { CashComponent } from '../ways/cash/cash.component';
import { DirectDebitComponent } from '../ways/direct-debit/direct-debit.component';
import { ChecksComponent } from '../ways/checks/checks.component';
import { ReCashComponent } from '../ways/re-cash/re-cash.component';
import { CouponComponent } from '../ways/coupon/coupon.component';
import { PointComponent } from '../ways/point/point.component';
import { Accounts, MemberType } from '../../../data';
import { OrderInfoVO } from '../../../data/models/receipt/order.info';
import { BonusInfoVO } from '../../../data/models/receipt/bonus.info';
import { PaymentsVO } from '../../../data/models/receipt/payments';
import { PriceVO } from '../../../data/models/receipt/price';
import { ProductEntryVO } from '../../../data/models/receipt/product';
import { ReceiptVO } from '../../../data/models/receipt/receipt.vo';
import { ReceiptService } from '../../../service';
import { InfoBroker } from '../../../broker';
import { Cart } from '../../../data/models/order/cart';

@Component({
  selector: 'pos-normal-payment',
  templateUrl: './normal-payment.component.html'
})
export class NormalPaymentComponent extends ModalComponent implements OnInit, OnDestroy {
  @ViewChildren('paytypes') paytypes: QueryList<ElementRef>;

  private cartInfo: Cart;
  accountInfo: Accounts;
  public memberType = MemberType;
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
    this.cartInfo = this.callerData.cartInfo;
  }

  ngOnDestroy() {
    this.receiptService.dispose();
  }

  /**
   * 신용카드
   * @param evt 키이벤트
   */
  creditCard(evt: any) {
    this.setSelected(evt);
    this.close();
    this.modal.openModalByComponent(CreditCardComponent,
      {
        callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo },
        closeByClickOutside: false,
        closeByEscape: true,
        modalId: 'CreditCardComponent',
        paymentType: 'n'
      }
    );
    // this.makeReceipt(this.accountInfo, this.cartInfo); // 영수증 인쇄 테스트 용으로 임시 적용
  }

  /**
   * 현금 IC 카드
   * @param evt 키이벤트
   */
  icCard(evt: any) {
    this.setSelected(evt);
    this.close();
    this.modal.openModalByComponent(IcCardComponent,
      {
        callerData: { account: this.accountInfo, cartInfo: this.cartInfo },
        closeByClickOutside: false,
        closeByEscape: false,
        modalId: 'IcCardComponent',
        paymentType: 'n'
      }
    );
  }

  /**
   * A포인트
   * @param evt 키이벤트
   */
  amwayPoint(evt: any) {
    this.setSelected(evt);
    // sprint 6차로 주석처리
    this.close();
    this.modal.openModalByComponent(PointComponent,
      {
        callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo },
        closeByClickOutside: false,
        modalId: 'APointComponent',
        pointType: 'a',
        paymentType: 'n'
      }
    );
  }

  /**
   * 멤버포인트
   * @param evt 키이벤트
   */
  memberPoint(evt: any) {
    this.setSelected(evt);
    // sprint 6차로 주석처리
    this.close();
    this.modal.openModalByComponent(PointComponent,
      {
        callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo },
        closeByClickOutside: false,
        modalId: 'MPointComponent',
        pointType: 'm',
        paymentType: 'n'
      }
    );
  }

  /**
   * 현금
   * @param evt 키이벤트
   */
  cashPayment(evt: any) {
    this.setSelected(evt);
    this.close();
    this.modal.openModalByComponent(CashComponent,
      {
        callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo },
        closeByClickOutside: false,
        modalId: 'CashComponent',
        paymentType: 'n'
      }
    );
  }

  /**
   * 수표
   * @param evt 키이벤트
   */
  checkPayment(evt: any) {
    this.setSelected(evt);
    this.close();
    this.modal.openModalByComponent(ChecksComponent,
      {
        callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo },
        closeByClickOutside: false,
        modalId: 'ChecksComponent',
        paymentType: 'n'
      }
    );
  }

  /**
   * 자동이체
   * @param evt 키이벤트
   */
  directDebitPayment(evt: any) {
    this.setSelected(evt);
    this.close();
    this.modal.openModalByComponent(DirectDebitComponent,
      {
        callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo },
        closeByClickOutside: false,
        modalId: 'DirectDebitComponent',
        paymentType: 'n'
      }
    );
  }

  /**
   * Re-Cash(A/P)
   * @param evt 키이벤트
   */
  reCashPayment(evt: any) {
    this.setSelected(evt);
    this.close();
    this.modal.openModalByComponent(ReCashComponent,
      {
        callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo },
        closeByClickOutside: false,
        modalId: 'ReCashComponent',
        paymentType: 'n'
      }
    );
  }

  /**
   * 쿠폰 : 결제하기 전에 반드시 먼저 선택되어야함.
   * @param evt 키이벤트
   */
  couponPayment(evt: any) {
    this.setSelected(evt);
    this.close();
    this.modal.openModalByComponent(CouponComponent,
      {
        closeByClickOutside: false,
        modalId: 'CouponComponent',
        paymentType: 'n'
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
  private makeReceipt(accountInfo: Accounts, cartInfo: Cart): void {
    const posId = this.storageService.getTerminalInfo().id;
    const tokenInfo = this.storageService.getTokenInfo();
    const productEntryList = new Array<ProductEntryVO>();

    const orderInfo = new OrderInfoVO(posId, tokenInfo.employeeId, tokenInfo.employeeName, accountInfo.parties[0].uid, accountInfo.parties[0].name);
    const productList = Array<any>();
    let totalPV = 0;
    let totalBV = 0;
    let totalPrice = 0;
    let totalQty = 0;
    this.cartInfo.entries.forEach(entry => {
      productList.push({
        'idx': entry.entryNumber,
        'skuCode': entry.product.code,
        'productName': entry.product.name,
        'price': entry.product.price.value.toString(),
        'qty': entry.quantity.toString(),
        'totalPrice': entry.totalPrice.value.toString()
      });
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
      this.alertService.info({ message: '주문이 완료되었습니다.' });
      this.close();
    } catch (e) {
      this.alertService.info({ message: '주문이 실패되었습니다.' });
    }
  }
}
