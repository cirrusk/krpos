import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService, Logger, AlertService, SpinnerService } from '../../../core';

import { SearchService, PagerService } from '../../../service';
import { AccountList, Accounts, Pagination } from '../../../data';
import { Utils } from '../../../core/utils';

@Component({
  selector: 'pos-search-account',
  templateUrl: './search-account.component.html'
})
export class SearchAccountComponent extends ModalComponent implements OnInit, OnDestroy {
  private PAGE_SIZE = 10;
  private searchSubscription: Subscription;
  private searchListSubscription: Subscription;
  private activeNum: number;                 // 선택 로우 번호
  private activeCode: string;                // 선택 코드
  private pager: Pagination;                 // pagination 정보
  currentLeftAccountList: Accounts[];        // 왼쪽 출력 리스트
  currentRightAccountList: Accounts[];       // 오른쪽 출력 리스트
  accountList: AccountList;                  // 회원 정보 리스트
  totalCnt: number;                          // 검색 총 합계
  paymentType: string;
  searchText: string;                        // 검색어
  @ViewChild('inputSearchText') searchValue: ElementRef;

  constructor(modalService: ModalService,
    private logger: Logger,
    private searchService: SearchService,
    private pagerService: PagerService,
    private alert: AlertService,
    private spinner: SpinnerService
  ) {
    super(modalService);
    this.spinner.hide();
    this.init();
  }

  ngOnInit() {
    this.logger.set('search.account.component', `결제 타입 --------------> ${this.paymentType}`).debug();
    setTimeout(() => { this.searchValue.nativeElement.focus(); }, 100); // 모달 팝업 포커스 보다 timeout을 더주어야 focus 잃지 않음.

    if (this.callerData) {
      const searchParams = this.callerData.data;
      if (searchParams.searchText.trim() !== '') {
        this.getAccountList('A', searchParams.searchText.trim());
        this.searchText = searchParams.searchText.trim();
      }
    }

  }

  ngOnDestroy() {
    if (this.searchSubscription) { this.searchSubscription.unsubscribe(); }
    if (this.searchListSubscription) { this.searchListSubscription.unsubscribe(); }
  }

  init() {
    if (this.currentLeftAccountList !== undefined) {
      this.currentLeftAccountList.length = 0;
    } else {
      this.currentLeftAccountList = new Array<Accounts>();
    }
    if (this.currentRightAccountList !== undefined) {
      this.currentRightAccountList.length = 0;
    } else {
      this.currentRightAccountList = new Array<Accounts>();
    }
    if (this.accountList !== undefined) {
      if (this.accountList.accounts) {
        this.accountList.accounts.length = 0;
      }
    } else {
      this.accountList = new AccountList();
    }

    this.activeNum = -1;
    this.activeCode = '';
    this.totalCnt = 0;
    this.paymentType = 'n';
    this.pager = new Pagination();
    this.searchText = '';
  }

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
      this.alert.warn({ title: '검색어 미입력', message: '검색어를 입력해주세요.' });
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
          return obj.parties[0].uid === uid;
        }
      );
      this.result = this.accountList.accounts[existedIdx]; // result로 본창에 전송(broker 삭제!)
      this.close();
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
    this.pager = this.pagerService.getPager(this.accountList.accounts.length, page, this.PAGE_SIZE);
    // 출력 리스트 생성
    if (this.accountList.accounts.length > 5) {
      this.currentLeftAccountList = this.accountList.accounts.slice(this.pager.startIndex, this.pager.startIndex + 5);
      this.currentRightAccountList = this.accountList.accounts.slice(this.pager.startIndex + 5, this.pager.endIndex + 1);
    } else {
      this.currentLeftAccountList = this.accountList.accounts.slice(this.pager.startIndex, this.pager.endIndex + 1);
      if (this.currentRightAccountList !== undefined) {
        this.currentRightAccountList.length = 0;
      }
    }
  }

  /**
   * 모달창 닫기
   */
  close() {
    this.closeModal();
  }
}
