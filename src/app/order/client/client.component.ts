import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { StorageService, Modal, Logger, Config } from '../../core';
import { ClientAccountComponent } from '../../modals';
import { Accounts, OrderEntry, Pagination, MemberType, PaymentCapture, PaymentView, ModalIds } from '../../data';
import { PagerService, PaymentService } from '../../service';
import { Cart } from '../../data/models/order/cart';
import { Order } from '../../data/models/order/order';

@Component({
  selector: 'pos-client',
  templateUrl: './client.component.html'
})
export class ClientComponent implements OnInit, OnDestroy {

  noticeList: string[] = [];
  accountInfo: Accounts;                          // 사용자 정보
  cartList: Array<OrderEntry>;                    // 장바구니 리스트
  currentCartList: Array<OrderEntry>;             // 출력 장바구니 리스트
  totalItem: number;                              // 총 수량
  totalPrice: number;                             // 총 금액
  totalPV: number;                                // 총 PV
  totalBV: number;                                // 총 Bv
  cartListCount: number;                          // 카트 목록 개수
  selectedCartNum: number;                        // 선택된 카트번호
  balance: number;                                // 회원 포인트
  recash: number;                                 // 회원 Re-Cash
  ccamount: number;
  installment: string;
  cashamount: number;
  pointamount: number;
  recashamount: number;
  ddamount: number;
  discount: number;
  received: number;
  change: number;
  accountType: string;                            // 회원 타입
  apprtype: string;
  ber: string;
  promotion: string;
  private pager: Pagination;                      // pagination 정보
  private resCart: Cart;
  private stsubscription: Subscription;
  private paymentsubscription: Subscription;
  public memberType = MemberType;
  constructor(private modal: Modal, private storage: StorageService, private payment: PaymentService,
    private logger: Logger, private config: Config, private route: ActivatedRoute,
    private pagerService: PagerService) {
    this.cartListCount = this.config.getConfig('cartListCount');
  }

  ngOnInit() {
    // this.accountInfo = this.storage.getCustomer();
    // this.accountType = this.accountInfo ? this.accountInfo.accountTypeCode.toUpperCase() : '';
    this.init();
    this.loadNotice();
    this.accountInfo = null; // new Accounts();
    this.stsubscription = this.storage.storageChanges.subscribe(
      result => {
        if (result) {
          this.logger.set('client.component', `storage subscribe ... ${result.key}`).debug();
          if (result.key === 'nc') {
            if (result.value === 'Y') {
              // this.modal.openModalByComponent(ClientAccountComponent,
              //   {
              //     modalId: ModalIds.CLIENT
              //   }
              // ).subscribe(() => {
              //   this.storage.removeLocalItem('nc');
              // });
            }
          } else if (result.key === 'customer') {
            // if (this.accountInfo) { this.init(); }
            if (result.value) {
              this.accountInfo = result.value;
            }
            this.accountType = this.accountInfo ? this.accountInfo.accountTypeCode.toUpperCase() : '';
            if (this.accountInfo && typeof this.accountInfo.balance !== 'undefined') {
              this.balance = this.accountInfo.balance[0].amount;
              this.recash = this.accountInfo.balance[1].amount;
            }
          } else if (result.key === 'orderentry') {
            if (result.value === null) {
              this.init();
            } else {
              this.resCart = result.value;
              if (this.resCart.entries instanceof Array) {
                // if (result.value.length === 0) { // 단건 삭제 시 빈 배열이므로 여기서 초기화
                //   this.init();
                // }
                this.init(); // 장바구니 담긴 정보 전체가 넘어오므로 무조건 전체삭제후 입력
                this.resCart.entries.forEach(orderentry => {
                  this.addCartEntry(orderentry);
                });
              } else {
                this.addCartEntry(this.resCart.entries);
              }
            }
          } else if (result.key === 'clearclient') {
            this.init();
            this.storage.removeOrderEntry();
            this.storage.removeCustomer();
            this.accountInfo = null;
          } else if (result.key === 'payinfo') {
            const data: any = result.value;
            if (data) {
              this.retreiveInfo(data[0], data[1]);
            }
          } else if (result.key === 'apprtype') {
            this.apprtype = '통합결제';
          } else if (result.key === 'Ber') {
            this.ber = result.value;
          } else if (result.key === 'cartPage') {
            this.setPage(this.storage.getCartPage());
          } else if (result.key === 'payinforeset' && result.value === true) {
            this.payInfoReset();
          } else if (result.key === 'promo') {
            this.promotion = result.value;
          }
        }
      });
  }

  ngOnDestroy() {
    if (this.stsubscription) { this.stsubscription.unsubscribe(); }
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
  }

  /**
   * Payment 정보, 주문정보 에서 각 금액을 가져옴
   *
   * @param paymentcapture PaymentInfo
   * @param order 주문 정보
   */
  private retreiveInfo(paymentcapture: PaymentCapture, order: Order) {
    if (paymentcapture) {
      const pay: PaymentView = this.payment.viewPayment(paymentcapture, order);
      this.ccamount = pay.cardamount ? pay.cardamount : 0;
      this.installment = pay.cardinstallment;
      this.cashamount = pay.cashamount ? pay.cashamount : 0;
      this.change = pay.cashchange ? pay.cashchange : 0;
      this.pointamount = pay.pointamount ? pay.pointamount : 0;
      this.recashamount = pay.recashamount ? pay.recashamount : 0;
      this.received = pay.receivedamount ? pay.receivedamount : 0;
      this.ddamount = pay.directdebitamount ? pay.directdebitamount : 0;
      if (order) {
        this.discount = pay.discount;
        this.totalPV = pay.pv;
        this.totalBV = pay.bv;
        this.totalPrice = pay.totalprice;
      }
    }
  }

  private payInfoReset() {
    this.ccamount = 0;
    this.installment = '';
    this.cashamount = 0;
    this.change = 0;
    this.pointamount = 0;
    this.recashamount = 0;
    this.received = 0;
    this.ddamount = 0;
  }

  private init() {
    // this.accountInfo = null;
    this.cartList = new Array<OrderEntry>();
    this.currentCartList = new Array<OrderEntry>();
    this.totalItem = 0;
    this.totalPrice = 0;
    this.totalPV = 0;
    this.totalBV = 0;
    this.ccamount = 0;
    this.cashamount = 0;
    this.pointamount = 0;
    this.recashamount = 0;
    this.ddamount = 0;
    this.discount = 0;
    this.received = 0;
    this.change = 0;
    this.selectedCartNum = -1;
    this.apprtype = '';
    this.pager = new Pagination();
    this.installment = '';
    this.ber = null;
    this.promotion = null;
  }


  private addCartEntry(orderEntry: OrderEntry) {
    const existedIdx: number = this.cartList.findIndex(
      function (obj) {
        return obj.product.code === orderEntry.product.code;
      }
    );

    // 리스트에 없을 경우
    if (existedIdx === -1) {
      this.cartList.push(orderEntry);
    } else {
      this.cartList[existedIdx] = orderEntry;
    }

    // 장바구니에 추가한 페이지로 이동
    this.setPage(this.storage.getCartPage() === null ? Math.ceil(this.cartList.length / this.cartListCount) : this.storage.getCartPage());
  }

  private setPage(page: number, pagerFlag: boolean = false) {
    if ((page < 1 || page > this.pager.totalPages) && pagerFlag) {
      return;
    }

    if (pagerFlag) {
      this.selectedCartNum = -1;
    }

    const currentData = this.pagerService.getCurrentPage(this.cartList, page, this.cartListCount);
    // pagination 생성 데이터 조회
    this.pager = Object.assign(currentData.get('pager'));
    // 출력 리스트 생성
    this.currentCartList = Object.assign(currentData.get('list'));
    this.totalPriceInfo();
  }

  private totalPriceInfo(): void {
    this.totalItem = this.resCart ? this.resCart.totalUnitCount : 0;
    this.totalPrice = this.resCart ? this.resCart.totalPrice.value : 0;
    this.totalPV = this.resCart && this.resCart.totalPrice.amwayValue ? this.resCart.totalPrice.amwayValue.pointValue : 0;
    this.totalBV = this.resCart && this.resCart.totalPrice.amwayValue ? this.resCart.totalPrice.amwayValue.businessVolume : 0;
  }

  activeRowCart(index: number): void {
    this.selectedCartNum = index;
  }

  /**
   * resolver 에서 가져온 공지사항을
   * 고객화면에 출력
   */
  private loadNotice() {
    const data = this.route.snapshot.data['notice'];
    this.noticeList = data;
  }

}
