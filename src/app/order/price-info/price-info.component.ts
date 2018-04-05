import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { AddCartBroker } from '../../broker/order/cart/add-cart.broker';
import { SearchBroker } from '../../broker/order/search/search.broker';
import { SearchAccountBroker } from '../../broker/order/search/search-account.broker';
import { CartService } from '../../service/order/cart.service';
import { SearchAccountComponent } from '../../modals/order/search-account/search-account.component';
import { StorageService, Modal } from '../../service/pos';

import { CartModification, CartInfo, CartEntry, Accounts, SearchParam } from '../../data/model';
import Utils from '../../core/utils';

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
              private storageService: StorageService,
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

          const terminalInfo = this.storageService.getItem('terminalInfo');
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
                                                                                this.cartInfo.guid,
                                                                                this.accountInfo.uid).subscribe(
      res => {
        console.log('update volume account' + res.status);
      },
      error => {
        console.error('update volume account error' + error);
      });
  }

  popupSearchUserInfo(searchText: string): void {
    if (this.searchMode === 'A') {
      this.modal.openModalByComponent(SearchAccountComponent,
        {
          title: '',
          message: '',
          width: '200%',
          actionButtonLabel: '확인',
          closeButtonLabel: '취소',
          // closeByEnter: true,
          closeByEscape: true,
          closeByClickOutside: true,
          closeAllDialogs: true
        }
      );
      this.searchParams.searchMode = this.searchMode;
      this.searchParams.searchText = searchText;
      this.searchBroker.sendInfo(this.searchParams);
    } else {
      this.addCartSubscription = this.cartService.addCartEntries(this.cartInfo.user.uid, this.cartInfo.guid, searchText).subscribe(
        result => {// 임시 로직
                   this.cartModification = result;
                   this.productInfo = new CartEntry(this.cartModification[0].entry.product.code,
                                                    this.cartModification[0].entry.product.name,
                                                    this.cartModification[0].entry.quantity,
                                                    this.cartModification[0].entry.product.price.value,
                                                    this.cartModification[0].entry.product.description);
                   this.addCartBroker.sendInfo(this.productInfo);
                    },
        err => { this.modal.openMessage(
                                        {
                                          title: '확인',
                                          message: err.error.errors[0].message,
                                          closeButtonLabel: '닫기',
                                          closeByEnter: false,
                                          closeByEscape: true,
                                          closeByClickOutside: true,
                                          closeAllDialogs: true
                                        }
                                      );
                                     }
      );
    }
  }
}
