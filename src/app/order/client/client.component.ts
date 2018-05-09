import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { StorageService, Modal, Logger, Config } from '../../core';
import { NewAccountComponent } from '../../modals';
import { Accounts, OrderEntry, Pagination } from '../../data';
import { PagerService } from '../../service';

@Component({
  selector: 'pos-client',
  templateUrl: './client.component.html'
})
export class ClientComponent implements OnInit, OnDestroy {

  private stsubscription: Subscription;
  public noticeList: string[] = [];
  accountInfo: Accounts;                          // 사용자 정보
  cartList: Array<OrderEntry>;                    // 장바구니 리스트
  currentCartList: Array<OrderEntry>;             // 출력 장바구니 리스트
  totalItem: number;                              // 총 수량
  totalPrice: number;                             // 총 금액
  totalPV: number;                                // 총 PV
  totalBV: number;                                // 총 Bv
  public cartListCount: number;                   // 카트 목록 개수
  private pager: Pagination;                        // pagination 정보
  private selectedCartNum: number;                // 선택된 카트번호
  constructor(private modal: Modal, private storage: StorageService,
    private logger: Logger, private config: Config, private pagerService: PagerService ) {
    this.cartListCount = this.config.getConfig('cartListCount');
  }

  ngOnInit() {
    this.init();
    this.loadNotice();
    this.accountInfo = this.storage.getCustomer();
    this.stsubscription = this.storage.storageChanges.subscribe(result => {
      if (result) {
        this.logger.set('client.component', `storage subscribe ... ${result.key}`).debug();
        if (result.key === 'nc') {
          if (result.value === 'Y') {
            this.modal.openModalByComponent(NewAccountComponent,
              {
                modalId: 'NewAccountComponent_CLIENT'
              }
            ).subscribe(data => {
              this.storage.removeLocalItem('nc');
            });
          }
        } else if (result.key === 'customer') {
          if (this.accountInfo) { this.init(); }
          this.accountInfo = result.value;
        } else if (result.key === 'orderentry') {
          if (result.value === null) {
            this.init();
          } else {
            if (result.value instanceof Array) {
              result.value.forEach(orderentry => {
                this.addCartEntry(orderentry);
              });
            } else {
              this.addCartEntry(result.value);
            }

          }
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.stsubscription) { this.stsubscription.unsubscribe(); }
  }

  private init() {
    this.cartList = new Array<OrderEntry>();
    this.currentCartList = new Array<OrderEntry>();
    this.totalItem = 0;
    this.totalPrice = 0;
    this.totalPV = 0;
    this.totalBV = 0;
    this.selectedCartNum = -1;
    this.pager = new Pagination();
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
    this.setPage(Math.ceil(this.cartList.length / this.cartListCount));
  }

  private setPage(page: number, pagerFlag: boolean = false) {
    if ((page < 1 || page > this.pager.totalPages) && pagerFlag) {
      return;
    }

    if (pagerFlag) {
      this.selectedCartNum = -1;
    }

    // pagination 생성 데이터 조회
    this.pager = this.pagerService.getPager(this.cartList.length, page);
    // 출력 리스트 생성
    this.totalPriceInfo();
    this.currentCartList = this.cartList.slice(this.pager.startIndex, this.pager.endIndex + 1);
  }

  private totalPriceInfo(): void {
    let sumItem = 0;
    let sumPrice = 0;
    let sumPV = 0;
    let sumBV = 0;

    this.cartList.forEach(entry => {
      sumItem += entry.quantity;
      sumPrice += entry.product.price.value * entry.quantity;
      sumPV += entry.totalPrice.amwayValue ? entry.totalPrice.amwayValue.pointValue : 0 ;
      sumBV += entry.totalPrice.amwayValue ? entry.totalPrice.amwayValue.businessVolume : 0 ;
    });

    this.totalItem = sumItem;
    this.totalPrice = sumPrice;
    this.totalPV = sumPV;
    this.totalBV = sumBV;
  }

  private activeRowCart(index: number): void {
    this.selectedCartNum = index;
  }

  private loadNotice() {
    this.noticeList.push('1. 주차권은 고객센터에서 수령하세요!');
    this.noticeList.push('2. 쿠폰은 계산전에 확인해주시기 바랍니다.');
    this.noticeList.push('3. 영수증은 꼭 받아가주시기 바랍니다.');
  }
}
