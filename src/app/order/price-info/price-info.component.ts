import { AlertType } from './../../core/alert/alert-type.enum';
import { AlertService } from './../../core/alert/alert.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { AddCartBroker } from '../../broker/order/cart/add-cart.broker';
import { SearchBroker } from '../../broker/order/search/search.broker';
import { SearchAccountBroker } from '../../broker/order/search/search-account.broker';
import { CartService } from '../../service/order/cart.service';
import { SearchAccountComponent } from '../../modals/account/search-account/search-account.component';
import { SearchProductComponent } from '../../modals/product/search-product/search-product.component';
import { StorageService, Modal } from '../../service/pos';

import { CartModification, CartInfo, CartEntry, Accounts, SearchParam } from '../../data/model';
import Utils from '../../core/utils';
import { NewAccountComponent } from '../../modals/account/new-account/new-account.component';

@Component({
  selector: 'pos-price-info',
  templateUrl: './price-info.component.html'
})
export class PriceInfoComponent implements OnInit, OnDestroy {
  private searchUserInfo: string;
  private cartInfoSubscription: Subscription;
  private accountInfoSubscription: Subscription;
  private updateVolumeAccountSubscription: Subscription;
  private addCartSubscription: Subscription;
  private accountInfo: Accounts;
  private searchMode: string;
  private searchParams: SearchParam;
  private cartInfo: CartInfo;
  private cartList: Array<CartEntry>;
  private productInfo: CartEntry;
  private cartModification: CartModification[];
  constructor(private modal: Modal,
              private cartService: CartService,
              private storage: StorageService,
              private alert: AlertService,
              private searchBroker: SearchBroker,
              private searchAccountBroker: SearchAccountBroker,
              private addCartBroker: AddCartBroker) {
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

  // 검샙 팝업
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
        closeAllModals: true
      }
    );
  }

  // 제품 검색
  callSearchProduct(): void {
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
                 this.productInfo = new CartEntry(this.cartModification[0].entry.product.code,
                                                  this.cartModification[0].entry.product.name,
                                                  this.cartModification[0].entry.quantity,
                                                  this.cartModification[0].entry.product.price.value,
                                                  this.cartModification[0].entry.product.description);
                 this.addCartBroker.sendInfo(this.productInfo);
      },
      err => { this.modal.openMessage({
                                        title: '확인',
                                        message: err.error.errors[0].message,
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
}


