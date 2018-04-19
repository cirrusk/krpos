import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SearchAccountComponent } from '../../modals/account/search-account/search-account.component';
import { NewAccountComponent } from '../../modals/account/new-account/new-account.component';

import { Modal, StorageService } from '../../service/pos';
import { CartService } from '../../service/order/cart.service';
import { AlertService } from '../../core/alert/alert.service';
import { SearchBroker } from '../../broker/order/search/search.broker';
import { SearchAccountBroker } from '../../broker/order/search/search-account.broker';
import { Subscription } from 'rxjs/Subscription';
import { Accounts, SearchParam, CartInfo, CartEntry, CartModification } from '../../data/model';
import { PagerService } from '../../service/common/pager.service';
import { SearchProductComponent } from '../../modals/product/search-product/search-product.component';
import { AddCartBroker } from '../../broker/order/cart/add-cart.broker';


@Component({
  selector: 'pos-cart-list',
  templateUrl: './cart-list.component.html'
})
export class CartListComponent implements OnInit, OnDestroy {
  private cartInfoSubscription: Subscription;
  private accountInfoSubscription: Subscription;
  private updateVolumeAccountSubscription: Subscription;
  private addCartSubscription: Subscription;
  private productSubscription: Subscription;

  private searchUserInfo: string;
  private accountInfo: Accounts;
  private searchMode: string;
  private searchParams: SearchParam;
  private cartInfo: CartInfo;
  private cartList: Array<CartEntry>;
  private productInfo: CartEntry;
  private cartModification: CartModification[];
  private currentCartList: CartEntry[];       // 출력 장바구니 리스트
  private currentPage: number;                // 현재 페이지 번호
  private pager: any = {};                    // pagination 정보

  private totalItem: number;
  private totalPrice: number;

  constructor(private modal: Modal,
              private cartService: CartService,
              private storage: StorageService,
              private alert: AlertService,
              private pagerService: PagerService,
              private searchBroker: SearchBroker,
              private addCartBroker: AddCartBroker,
              private searchAccountBroker: SearchAccountBroker) {
    this.cartList = new Array<CartEntry>();
    this.searchMode = 'A';
    this.searchParams = new SearchParam();

    this.accountInfoSubscription = this.searchAccountBroker.getInfo().subscribe(
      result => {
        console.log('++*** accounts Info subscribe ... ',  result);
        if (result) {
          this.accountInfo = result;
          this.createCartInfo();
        }
      }
    );

    this.productSubscription = this.addCartBroker.getInfo().subscribe(
      productInfo => {
        console.log('++*** product Info subscribe ... ',  productInfo);
        if (productInfo) {
          this.addCartEntries(productInfo.code);
        }
      }
    );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.accountInfoSubscription.unsubscribe();
    if (this.updateVolumeAccountSubscription) {
      this.updateVolumeAccountSubscription.unsubscribe();
    }
    if (this.addCartSubscription) {
      this.addCartSubscription.unsubscribe();
    }
  }

  activeSearchMode(mode: string): void {
    this.searchMode = mode;
  }

  updateVolumeAccount(cartInfo: CartInfo): void {
    this.updateVolumeAccountSubscription = this.cartService.updateVolumeAccount(this.cartInfo.user.uid,
                                                                                this.cartInfo.code,
                                                                                this.accountInfo.uid).subscribe(
      res => {
        console.log('update volume account' + res.status);
      },
      error => {
        console.error('update volume account error' + error);
      });
  }

  // 검색 팝업
  popupSearch(searchText: string): void {
    // param 설정
    this.searchParams.searchMode = this.searchMode;
    this.searchParams.searchText = searchText;

    // 회원검색
    if (this.searchMode === 'A') {
      this.callSearchAccount();
    // 제품 검색
    } else {
      this.callSearchProduct();
    }
    this.searchBroker.sendInfo(this.searchParams);
  }

  // 유저정보 검색
  callSearchAccount(): void {
    this.modal.openModalByComponent(SearchAccountComponent,
      {
        title: '',
        message: '',
        actionButtonLabel: '선택',
        closeButtonLabel: '취소',
        closeByEscape: true,
        closeByClickOutside: true,
        closeAllModals: true,
        modalId: 'SearchAccountComponent'
      }
    );
  }

  // 제품 검색
  callSearchProduct(): void {
    // this.addCartEntries(this.searchParams.searchText);

    // 추후 지정
    this.modal.openModalByComponent(SearchProductComponent,
      {
        title: '',
        message: '',
        actionButtonLabel: '선택',
        closeButtonLabel: '취소',
        closeByEnter: false,
        closeByEscape: true,
        closeByClickOutside: true,
        closeAllModals: false,
        modalId: 'SearchProductComponent'
      }
    );
  }

  popupNewAccount() {
    // this.alert.show( {alertType: AlertType.warn, title: '제목', message: '메시지'} );
    this.modal.openModalByComponent(NewAccountComponent,
      {
        title: '',
        message: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByEnter: false,
        closeByEscape: true,
        closeByClickOutside: true,
        closeAllModals: false,
        modalId: 'NewAccountComponent'
      }
    );
  }

  // 장바구니 생성
  createCartInfo(): void {
    const terminalInfo = this.storage.getTerminalInfo();
    this.cartInfoSubscription = this.cartService.createCartInfo(this.accountInfo.uid,
                                                                this.accountInfo.uid,
                                                                terminalInfo.pointOfService.name , 'POS').subscribe(
      cartResult => {
        this.cartInfo = cartResult;
        this.updateVolumeAccount(this.cartInfo);
      },
      err => {
        console.error(err);
      }
    );
  }

  // 장바구니 담기
  addCartEntries(searchText: string): void {
    this.addCartSubscription = this.cartService.addCartEntries(this.cartInfo.user.uid, this.cartInfo.code, searchText).subscribe(
      result => {// 임시 로직
                 this.cartModification = result;
                 this.productInfo = new CartEntry(this.cartModification[0].entry.entryNumber,
                                                  this.cartModification[0].entry.product.code,
                                                  this.cartModification[0].entry.product.name,
                                                  this.cartModification[0].entry.quantity,
                                                  this.cartModification[0].entry.product.price.value,
                                                  this.cartModification[0].entry.product.description);
                 this.addCartEntry(this.productInfo);
      },
      err => { this.modal.openMessage({
                                        title: '확인',
                                        message: err.error.errors[0].message ? err.error.errors[0].message : err.error.errors[0].type,
                                        closeButtonLabel: '닫기',
                                        closeByEnter: false,
                                        closeByEscape: true,
                                        closeByClickOutside: true,
                                        closeAllModals: true,
                                        modalId: 'ADD_CAR_ERROR'
                                      }
                                    );
      }
    );
  }

  // 주문 리스트 추가
  private addCartEntry(cartEntry: CartEntry) {
    const existedIdx: number = this.cartList.findIndex(
      function (obj) {
        return obj.code === cartEntry.code;
      }
    );

    // 리스트에 없을 경우
    if (existedIdx === -1) {
      this.cartList.push(
          {entryNumber: cartEntry.entryNumber,
           code: cartEntry.code,
           name: cartEntry.name,
           qty: 1,
           price: cartEntry.price,
           desc: cartEntry.desc}
      );
    } else {
        this.cartList[existedIdx].qty++;
    }

    // 장바구니에 추가한 페이지로 이동
    this.setPage(Math.ceil(this.cartList.length / 10));
  }

  removeItemCart(code: string): void {
    let index = this.cartList.findIndex(function (obj) {
      return obj.code === code;
    });

    this.cartList.splice(index, 1);

    index = index <= this.cartList.length ? index + 1 : index - 1;
    this.setPage(Math.ceil(index / 10));
  }

  // 출력 데이터 생성
  setPage(page: number, pagerFlag: boolean = false) {
    if ((page < 1 || page > this.pager.totalPages) && pagerFlag) {
      return;
    }

    // pagination 생성 데이터 조회
    this.pager = this.pagerService.getPager(this.cartList.length, page);
    // 출력 리스트 생성
    this.currentCartList = this.cartList.slice(this.pager.startIndex, this.pager.endIndex + 1);
  }
}
