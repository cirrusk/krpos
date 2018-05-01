import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService, Modal, Logger, AlertService, AlertType, SpinnerService } from '../../../core';

import { SearchService, PagerService } from '../../../service';
import { SearchBroker, SearchAccountBroker } from '../../../broker';
import { AccountList, Accounts } from '../../../data';
import Utils from '../../../core/utils';
import { PhoneContactInfo } from '../../../data/models/order/phone-contact-info';

@Component({
  selector: 'pos-search-account',
  templateUrl: './search-account.component.html'
})
export class SearchAccountComponent extends ModalComponent implements OnInit, OnDestroy {
  private searchSubscription: Subscription;
  private searchListSubscription: Subscription;
  private cartInfoSubscription: Subscription;
  private account: Accounts;                 // 회원 정보
  private activeNum: number;                 // 선택 로우 번호
  private activeCode: string;                // 선택 코드
  private searchMemberType: string;          // 회원 유형

  private currentPage: number;               // 현재 페이지 번호
  private pager: any = {};                   // pagination 정보
  currentLeftAccountList: Accounts[];        // 왼쪽 출력 리스트
  currentRightAccountList: Accounts[];       // 오른쪽 출력 리스트

  accountList: AccountList;                  // 회원 정보 리스트
  totalCnt: number;                          // 검색 총 합계
  paymentType: string;
  searchText: string;                        // 검색어
  constructor(modalService: ModalService,
      private modal: Modal,
      private logger: Logger,
      private searchService: SearchService,
      private pagerService: PagerService,
      private alert: AlertService,
      private spinner: SpinnerService,
      private searchBroker: SearchBroker,
      private searchAccountBroker: SearchAccountBroker
    ) {
    super(modalService);
    this.activeNum = -1;
    this.activeCode = '';
    this.totalCnt = 0;
    this.paymentType = 'n';

    this.searchSubscription = this.searchBroker.getInfo().subscribe(
      result => {
        if (result.data.searchText.trim() && result.type === 'account') {
          // 전달 받은 데이터로 검색
          this.getAccountList(result.data.searchType, result.data.searchText);
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
  }

  // account 검색
  /**
   * account 검색
   * @param searchMemberType
   * @param searchText
   */
  getAccountList(searchMemberType: string, searchText: string): void {
    if (searchText.trim()) {
      this.activeNum = -1;
      this.spinner.show();
      this.searchListSubscription = this.searchService.getAccountList(searchMemberType, searchText)
                                                      .subscribe(
                                                        result => {
                                                          if (result) {
                                                            this.accountList = result;
                                                            this.totalCnt = this.accountList.accounts.length;
                                                            this.setPage(1);
                                                          }
                                                      },
                                                      error => {
                                                        this.spinner.hide();
                                                        const errdata = Utils.getError(error);
                                                        if (errdata) {
                                                          this.logger.set('cartList.component', `Add cart error type : ${errdata.type}`).error();
                                                          this.logger.set('cartList.component', `Add cart error message : ${errdata.message}`).error();
                                                          this.alert.error({ message: `${errdata.message}` });
                                                        }
                                                      },
                                                      () => { this.spinner.hide(); }
                                                      );
    } else {
      this.alert.warn( {title: '검색어 미입력', message: '검색어를 입력해주세요.' } );
      return;
    }
  }

  /**
   * 테이블 로우 Class 적용(on)
   * @param index
   */
  activeRow(index: number, code: string): void {
    this.activeNum = index;
    this.activeCode = code;
  }

  /**
   * account 정보 전달
   */
  sendAccountInfo(): void {
    if (this.activeNum > -1) {
      const uid = this.activeCode;
      const existedIdx: number = this.accountList.accounts.findIndex(
        function (obj) {
          return obj.uid === uid;
        }
      );
      this.account = this.accountList.accounts[existedIdx];
      this.searchAccountBroker.sendInfo(this.account);
      this.modal.clearAllModals(this);
    } else {
      this.alert.warn({ message: `회원을 선택해주시기 바랍니다.` });
    }
  }

  /**
   * 출력 데이터 생성
   */
  setPage(page: number, pagerFlag: boolean = false) {
    if ((page < 1 || page > this.pager.totalPages) && pagerFlag) {
      return;
    }

    if (pagerFlag) {
      this.activeNum = -1;
    }

    // pagination 생성 데이터 조회
    this.pager = this.pagerService.getPager(this.accountList.accounts.length, page);
    // 출력 리스트 생성
    if (this.accountList.accounts.length > 5) {
      this.currentLeftAccountList  = this.accountList.accounts.slice(this.pager.startIndex, this.pager.startIndex + 6);
      this.currentRightAccountList = this.accountList.accounts.slice(this.pager.startIndex + 5, this.pager.endIndex + 1);
    } else {
      this.currentLeftAccountList  = this.accountList.accounts.slice(this.pager.startIndex, this.pager.endIndex + 1);
    }
  }

  /**
   * 모달창 닫기
   */
  close() {
    this.modal.clearAllModals(this);
  }
}
