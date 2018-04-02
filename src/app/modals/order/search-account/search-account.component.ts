import { Component, OnInit, Renderer, OnDestroy } from '@angular/core';
import { ModalComponent } from '../../../core/modal/modal.component';
import { Subscription } from 'rxjs/Subscription';
import { ModalService, Modal, Logger } from '../../../service/pos';
import { AccountList } from '../../../data/models/order/account-list';
import { Accounts } from '../../../data/models/order/accounts';
import { SearchService } from '../../../service/order/search.service';
import { SearchBroker } from '../../../broker/order/search/search.broker';
import { SearchAccountBroker } from '../../../broker/order/search/search-account.broker';

@Component({
  selector: 'pos-search-account',
  templateUrl: './search-account.component.html',
  styleUrls: ['./search-account.component.css']
})
export class SearchAccountComponent extends ModalComponent implements OnInit, OnDestroy {
  private accountList: AccountList; // 회원 정보 리스트
  private account: Accounts; // 회원 정보
  private activeNum: number; // 선택 로우 번호
  private totalCnt: number; // 검색 총 합계
  private searchSubscription: Subscription;
  private searchListSubscription: Subscription;
  private searchMemberType: string; // 회원 유형
  private searchText: string; // 검색어

  constructor(modalService: ModalService,
      private renderer: Renderer,
      private modal: Modal,
      private logger: Logger,
      private searchService: SearchService,
      private searchBroker: SearchBroker,
      private searchAccountBroker: SearchAccountBroker
    ) {
    super(modalService);
    this.activeNum = -1;
    this.totalCnt = 0;

    this.searchSubscription = this.searchBroker.getInfo().subscribe(
      result => {
        if (result.searchText) {
          // 전달 받은 데이터로 검색
          this.getAccountList(result.searchType, result.searchText);

          // 추후 제거 예정
          this.totalCnt = 1;
          this.searchText = result.searchText;
        }
      }
    );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
    this.searchListSubscription.unsubscribe();
  }

  // account 검색
  getAccountList(searchMemberType: string, searchText: string): void {
    if (searchText) {
      this.activeNum = -1;
      this.searchListSubscription = this.searchService.getAccountList(searchMemberType, searchText)
                                                      .subscribe(result => this.accountList = result);
      // 추후 페이징 처리 후 제거
      this.totalCnt = 1;

    } else {
      this.modal.openMessage(
        {
          title: '검색어 미입력',
          message: `검색어를 입력해주세요.`,
          closeButtonLabel: '닫기',
          closeByEnter: false,
          closeByEscape: true,
          closeByClickOutside: true,
          closeAllDialogs: true
        }
      );
      return;
    }
  }

  // 테이블 로우 Class 적용(on)
  activeRow(index: number): void {
    this.activeNum = index;
  }

  // account 정보 전달
  sendAccountInfo(): void {
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
