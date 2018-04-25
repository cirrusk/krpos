import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent } from '../../../core/modal/modal.component';
import { ModalService, Modal, Logger } from '../../../service/pos';
import { SearchService } from '../../../service/order/search.service';
import { SearchBroker } from '../../../broker/order/search/search.broker';
import { SearchAccountBroker } from '../../../broker/order/search/search-account.broker';
import { CartService } from '../../../service/order/cart.service';
import { CartInfo, AccountList, Accounts } from '../../../data/model';
import { AlertService } from '../../../core/alert/alert.service';
import { AlertType } from '../../../core/alert/alert-type.enum';

@Component({
  selector: 'pos-search-account',
  templateUrl: './search-account.component.html'
})
export class SearchAccountComponent extends ModalComponent implements OnInit, OnDestroy {
  accountList: AccountList; // 회원 정보 리스트
  private account: Accounts; // 회원 정보
  private activeNum: number; // 선택 로우 번호
  totalCnt: number; // 검색 총 합계
  private searchSubscription: Subscription;
  private searchListSubscription: Subscription;
  private cartInfoSubscription: Subscription;
  private searchMemberType: string; // 회원 유형
  searchText: string; // 검색어
  private cartInfo: CartInfo;
  paymentType: string;

  constructor(modalService: ModalService,
      private modal: Modal,
      private logger: Logger,
      private searchService: SearchService,
      private cartService: CartService,
      private alert: AlertService,
      private searchBroker: SearchBroker,
      private searchAccountBroker: SearchAccountBroker
    ) {
    super(modalService);
    this.activeNum = -1;
    this.totalCnt = 0;
    this.paymentType = 'n';

    this.searchSubscription = this.searchBroker.getInfo().subscribe(
      result => {
        if (result.data.searchText.trim() && result.type === 'account') {
          // 전달 받은 데이터로 검색
          this.getAccountList(result.data.searchType, result.data.searchText);

          // 추후 제거 예정
          this.totalCnt = this.accountList === undefined ? 0 : this.accountList.accounts.length;
          this.searchText = result.data.searchText;
        }
      }
    );
  }

  ngOnInit() {
    this.logger.set('search.account.component', `결제 타입 --------------> ${this.paymentType}`).debug();
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
    if (this.searchListSubscription) {
      this.searchListSubscription.unsubscribe();
    }
    if (this.cartInfoSubscription) {
      this.cartInfoSubscription.unsubscribe();
    }
  }

  // account 검색
  getAccountList(searchMemberType: string, searchText: string): void {
    if (searchText.trim()) {
      this.activeNum = -1;
      this.searchListSubscription = this.searchService.getAccountList(searchMemberType, searchText)
                                                      .subscribe(
                                                        result => {this.accountList = result;
                                                        // 추후 페이징 처리 후 제거
                                                        this.totalCnt = this.accountList === undefined ?
                                                                                             0 : this.accountList.accounts.length;
                                                      },
                                                      err => {
                                                        this.alert.show( {alertType: AlertType.warn,
                                                                          title: '경고',
                                                                          message: err.error.errors[0].message,
                                                                          timer: true,
                                                                          interval: 2000 } );
                                                      });
    } else {
      this.alert.show( {alertType: AlertType.warn, title: '검색어 미입력', message: '메시지', timer: true, interval: 2000 } );
      return;
    }
  }

  // 테이블 로우 Class 적용(on)
  activeRow(index: number): void {
    this.activeNum = index;
  }

  // account 정보 전달
  sendAccountInfo(): void {
    // 테스트
    this.account = new Accounts();
    this.account.accountType = 'AMWAY BUSINESS OWNER';
    this.account.name = '암웨이';
    this.account.status = 'ACTIVE';
    this.account.totalBV = 100;
    this.account.totalPV = 200;
    this.account.uid = '7480003';
    this.searchAccountBroker.sendInfo(this.account);
    this.modal.clearAllModals(this);

    if (this.activeNum > -1) {
      this.account = this.accountList.accounts[this.activeNum];
      this.searchAccountBroker.sendInfo(this.account);
      this.modal.clearAllModals(this);
    }
  }

  // 모달창 닫기
  close() {
    this.modal.clearAllModals(this);
  }
}
