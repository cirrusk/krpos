import { Accounts } from './../../data/models/order/accounts';
import { OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { SearchParam } from '../../data/models/order/search-param';
import { Modal } from '../../service/pos';
import { SearchAccountComponent } from '../../modals/order/search-account/search-account.component';
import { SearchBroker } from '../../broker/order/search/search.broker';
import { SearchAccountBroker } from '../../broker/order/search/search-account.broker';

@Component({
  selector: 'pos-price-info',
  templateUrl: './price-info.component.html',
  styleUrls: ['./price-info.component.css']
})
export class PriceInfoComponent implements OnInit, OnDestroy {
  private searchUserInfo: string;
  private accountInfoSubscription: Subscription;
  private accountInfo: Accounts;
  private searchMode: string;
  private searchParams: SearchParam;

  constructor(private modal: Modal,
              private searchBroker: SearchBroker,
              private searchAccountBroker: SearchAccountBroker) {
    this.searchMode = 'A';
    this.searchParams = new SearchParam();
    this.accountInfoSubscription = this.searchAccountBroker.getInfo().subscribe(
      result => {
        console.log('++*** accounts Info subscribe ... ',  result);
        this.accountInfo = result;
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
    }
  }
}
