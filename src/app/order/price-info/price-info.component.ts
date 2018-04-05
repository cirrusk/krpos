import { AddCartBroker } from './../../broker/order/cart/add-cart.broker';
import { CartEntry } from './../../data/models/order/cart-entryt';
import { Accounts } from './../../data/models/order/accounts';
import { OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { SearchParam } from '../../data/models/order/search-param';
import { Modal } from '../../service/pos';
import { SearchAccountComponent } from '../../modals/order/search-account/search-account.component';
import { SearchBroker } from '../../broker/order/search/search.broker';
import { SearchAccountBroker } from '../../broker/order/search/search-account.broker';
import { CartInfo } from '../../data/models/order/cart-info';
import { CartService } from '../../service/order/cart.service';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import Utils from '../../core/utils';
import { CartModification } from '../../data/model';

@Component({
  selector: 'pos-price-info',
  templateUrl: './price-info.component.html'
})
export class PriceInfoComponent implements OnInit, OnDestroy {
  private searchUserInfo: string;
  private cartInfoSubscription: Subscription;
  private accountInfoSubscription: Subscription;
  private accountInfo: Accounts;
  private searchMode: string;
  private searchParams: SearchParam;
  private cartInfo: CartInfo;
  private cartList: Array<CartEntry>;
  private productInfo: CartEntry;
  private cartModification: CartModification;

  constructor(private modal: Modal,
              private cartService: CartService,
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

          const terminalInfo = JSON.parse(sessionStorage.getItem('terminalInfo'));
          this.cartInfoSubscription = this.cartService.createCartInfo(this.accountInfo.uid,
                                                             this.accountInfo.uid, terminalInfo.pointOfService.name , 'POS').subscribe(
          cartResult => {this.cartInfo = cartResult; },
          err => {console.error(err); }
          );
        }
      }
    );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.accountInfoSubscription.unsubscribe();
  }

  activeSearchMode(mode: string): void {
    this.searchMode = mode;
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
      this.cartService.addCartEntries(this.cartInfo.user.uid, this.cartInfo.guid, searchText).subscribe(
        result => {// 임시 로직
                   this.cartModification = result;
                   this.productInfo.code = this.cartModification.entry.product.code;
                   this.productInfo.name = this.cartModification.entry.product.name;
                   this.productInfo.qty = this.cartModification.entry.quantity;
                   this.productInfo.price = this.cartModification.entry.product.price.value;
                   this.productInfo.desc = this.cartModification.entry.product.description;
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
