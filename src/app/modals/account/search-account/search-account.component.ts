import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService, Logger, AlertService } from '../../../core';

import { SearchService, PagerService, MessageService, AccountService } from '../../../service';
import { AccountList, Accounts, Pagination, MemberType, ResponseMessage, Block, OrderType, SearchMemberType } from '../../../data';
import { Utils } from '../../../core/utils';

/**
 * 회원 검색 팝업
 */
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
    private searchMemType: string = SearchMemberType.ABO;
    private regexOnlyNum: RegExp = new RegExp(/^[0-9]+(\.[0-9]*){0,1}$/g); // 숫자만
    private regex: RegExp = /[^0-9]+/g;
    private regexMobile: RegExp = /^\d{3}\d{3,4}\d{4}$/;
    private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'Delete', 'ArrowLeft', 'ArrowRight'];
    currentLeftAccountList: Accounts[];        // 왼쪽 출력 리스트
    currentRightAccountList: Accounts[];       // 오른쪽 출력 리스트
    accountList: AccountList;                  // 회원 정보 리스트
    totalCnt: number;                          // 검색 총 합계
    paymentType: string;
    orderType: string;
    memberType = MemberType;                                                  // HTML 사용(enum)
    @ViewChild('inputSearchText') private searchValue: ElementRef;
    @ViewChild('searchMemberType') private searchMemberType: ElementRef;
    eOrderType = OrderType;

    constructor(modalService: ModalService,
        private message: MessageService,
        private logger: Logger,
        private alert: AlertService,
        private searchService: SearchService,
        private pagerService: PagerService,
        private accountService: AccountService,
        private element: ElementRef
    ) {
        super(modalService);
        this.init();
    }

    ngOnInit() {
        setTimeout(() => { this.searchValue.nativeElement.focus(); }, 100); // 모달 팝업 포커스 보다 timeout을 더주어야 focus 잃지 않음.
        if (this.callerData) {
            const searchParams = this.callerData.data;
            if (searchParams.searchText && searchParams.searchText.trim() !== '') {
                this.searchValue.nativeElement.value = searchParams.searchText.trim();
                this.getAccountList(SearchMemberType.ABO, searchParams.searchText.trim());
            }
        }
    }

    ngOnDestroy() {
        if (this.searchSubscription) { this.searchSubscription.unsubscribe(); }
        if (this.searchListSubscription) { this.searchListSubscription.unsubscribe(); }
    }

    selectChangeHandler(memType: string, memIndex: number) {
        this.searchMemType = memType;
        if (memIndex === -1) {
            this.searchMemberType.nativeElement.value = SearchMemberType.ABO;
        }
        if (this.searchMemType === SearchMemberType.CONSUMER) {
            this.searchValue.nativeElement.value = '';
        }
        setTimeout(() => { this.searchValue.nativeElement.focus(); this.searchValue.nativeElement.select(); }, 190);
    }

    init(cancel = false) {
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
        this.pager = new Pagination();
        if (cancel) {
            this.searchValue.nativeElement.value = '';
            this.searchMemberType.nativeElement.value = SearchMemberType.ABO;
            this.searchValue.nativeElement.focus();
        }
    }

    /**
     * account 검색
     *
     * 회원 검색시 회원 블록 체크를 반드시 수행해야함.
     * 체크 후 2번인 경우 메시지 다음 메시지 출력
     * @example
     * 홍길동 회원님 (7480028410)은
     * 미갱신 상태 입니다. 회원 갱신이 필요합니다.
     * (갱신기간: 2018.03~08)
     *
     * 0. 정상체크 : 0
     * 1. 기본체크 : 회원 탈퇴 및 존재여부
     * 2. 프로필 업데이트 : 자동갱신, 일반 갱신 기간에 갱신 하지 않은 회원
     * 3. 주문 블락 체크
     * 
     * @add 2018.09.19 아이디 생성될때는 대문자로 생성되기 때문에 조회 시 변경 필요
     *
     * @param {string} searchMemberType 검색 회원 타입
     * @param {string} searchText 검색어
     */
    getAccountList(searchMemberType: string, searchText: string): void {
        if (searchText && searchText.trim()) {
            this.activeNum = -1;
            if (searchMemberType === SearchMemberType.CONSUMER) {
                if (!this.regexMobile.test(searchText)) {
                    this.alert.warn({ message: '잘못된 휴대폰/전화 번호입니다.', timer: true, interval: 1500 });
                    setTimeout(() => { this.searchValue.nativeElement.focus(); }, 1520);
                    return;
                }
            }
            this.getAccount(searchMemberType, searchText);
        } else {
            this.alert.warn({ message: '검색어를 입력해주세요.', timer: true, interval: 1500 });
            setTimeout(() => { this.searchValue.nativeElement.focus(); }, 1520);
            return;
        }
    }

    /**
     * 회원 조회하기
     *
     * @param {string} searchMemberType 검색 회원 타입
     * @param {string} searchText 검색어
     */
    private getAccount(searchMemberType: string, searchText: string) {
        this.searchListSubscription = this.searchService.getAccountList(searchMemberType, searchText).subscribe(result => {
            if (result) {
                setTimeout(() => { this.searchValue.nativeElement.focus(); this.searchValue.nativeElement.select(); }, 100);
                this.accountList = result;
                this.totalCnt = this.accountList.accounts.length;
                this.setPage(1);
            }
        }, error => {
            const errdata = Utils.getError(error);
            if (errdata) {
                this.logger.set('search.account.component', `get account error message : ${errdata.message}`).error();
                if (errdata.type === 'UnknownIdentifierError') {
                    this.alert.error({ message: `${searchText} 로 검색된 사용자가 존재하지 않습니다.`});
                } else {
                    this.alert.error({ message: this.message.get('server.error', errdata.message) });
                }
            }
        });
    }

    /**
     * 회원 블록 체크
     *
     * @param {ResponseMessage} resp 응답값
     * @param {Accounts} accountid 회원 정보
     */
    private checkUserBlock(resp: ResponseMessage, account: Accounts): string {
        if (resp.code === Block.INVALID) {
            this.alert.error({ title: '알림', message: this.message.get('block.invalid'), timer: true, interval: 2000 });
        } else if (resp.code === Block.NOT_RENEWAL) {
            const custname = account.accountTypeCode === MemberType.ABO ? account.name : account.parties[0].name;
            this.alert.error({ title: '알림', message: this.message.get('block.notrenewal', custname, account.uid, resp.returnMessage), timer: true, interval: 2000 });
        } else if (resp.code === Block.LOGIN_BLOCKED) {
            this.alert.error({ title: '알림', message: this.message.get('block.loginblock'), timer: true, interval: 2000 });
        } else if (resp.code === Block.ORDER_BLOCK) {
            this.alert.error({ title: '알림', message: this.message.get('block.orderblock'), timer: true, interval: 2000 });
        }
        if (resp.code !== Block.VALID) {
            setTimeout(() => { this.searchValue.nativeElement.focus(); }, 500);
        }
        return resp.code;
    }

    /**
     * 테이블 로우 Class 적용(on)
     * @param index
     */
    activeRow(index: number, code: string): void {
        this.activeNum = index;
        this.activeCode = code;
        this.sendAccountInfo();
    }

    /**
     * account 정보 전달
     *
     * 중요 체크 내용)
     * 검색된 사용자에 대해서 확인 버튼을 클릭할 경우
     * 회원 블록체크를 수행함.
     */
    sendAccountInfo(): void {
        if (this.activeNum > -1) {
            const uid = this.activeCode;
            const existedIdx: number = this.accountList.accounts.findIndex(
                function (obj) {
                    return obj.parties[0].uid === uid;
                }
            );
            const account: Accounts = this.accountList.accounts[existedIdx];
            this.accountService.checkBlock(account).subscribe(
                resp => {
                    const code = this.checkUserBlock(resp, account);
                    if (code === Block.VALID) {
                        this.result = this.accountList.accounts[existedIdx]; // result로 본창에 전송(broker 삭제!)
                        this.close();
                    }
                },
                error => {
                    if (error) {
                        const errdata = Utils.getError(error);
                        if (errdata) {
                            const errtype = this.accountService.checkError(errdata);
                            this.logger.set('search.account', `search error type : ${errtype}`).all();
                        } else {
                            const resp = new ResponseMessage(error.error.code, error.error.returnMessage);
                            this.checkUserBlock(resp, account);
                        }
                    }
                });
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

    /**
     * 소비자인 경우 INPUT에 휴대폰번호(숫자)만 입력되도록 처리
     *
     * @param evt 키보드 이벤트
     */
    @HostListener('input', ['$event'])
    onInputKeyDown(evt: any) {
        if (evt.target.tagName === 'SELECT') { return; }
        if (this.searchMemType === SearchMemberType.CONSUMER) {
            if (this.specialKeys.indexOf(evt.key) !== -1) {
                return;
            }
            evt.target.value = evt.target.value.replace(this.regex, '');
            let current: string = this.element.nativeElement.value;
            current = current ? current : '';
            const next: string = current.concat(evt.key);
            if (next && !String(next).match(this.regexOnlyNum)) {
                evt.preventDefault();
            }
        }
    }
}
