import { Component, OnInit, OnDestroy, HostListener, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SearchAccountComponent } from '../../modals/account/search-account/search-account.component';
import { NewAccountComponent } from '../../modals/account/new-account/new-account.component';
import { SearchProductComponent } from '../../modals/product/search-product/search-product.component';

import { Modal, StorageService, Logger } from '../../service/pos';
import { CartService } from '../../service/order/cart.service';
import { PagerService } from '../../service/common/pager.service';
import { AlertService } from '../../core/alert/alert.service';
import { SpinnerService } from '../../core/spinner/spinner.service';
import { SearchBroker } from '../../broker/order/search/search.broker';
import { SearchAccountBroker } from '../../broker/order/search/search-account.broker';
import { AddCartBroker } from '../../broker/order/cart/add-cart.broker';
import { Subscription } from 'rxjs/Subscription';
import { Accounts, SearchParam, CartInfo, CartEntry, CartModification } from '../../data/model';
import { AlertType } from '../../core/alert/alert-type.enum';
import Utils from '../../core/utils';



@Component({
  selector: 'pos-cart-list',
  templateUrl: './cart-list.component.html'
})
export class CartListComponent implements OnInit, OnDestroy {
  private cartInfoSubscription: Subscription;
  private accountInfoSubscription: Subscription;
  private updateVolumeAccountSubscription: Subscription;
  private addCartSubscription: Subscription;
  private updateCartSubscription: Subscription;
  private productSubscription: Subscription;
  private removeEntrySubscription: Subscription;
  private removeCartSubscription: Subscription;

  private searchParams: SearchParam;              // 조회 파라미터
  private cartInfo: CartInfo;                     // 장바구니 기본정보
  private productInfo: CartEntry;                 // 제품 정보
  private addCartModel: CartModification[];       // 장바구니 담기 응답모델
  private updateCartModel: CartModification;      // 장바구니 수정 응답모델
  private currentPage: number;                    // 현재 페이지 번호
  private pager: any = {};                        // pagination 정보
  private selectedCartNum: number;                // 선택된 카트번호
  private modifyFlag: boolean;

  accountInfo: Accounts;                          // 사용자 정보
  searchMode: string;                             // 조회 모드
  cartList: Array<CartEntry>;                     // 장바구니 리스트
  currentCartList: Array<CartEntry>;              // 출력 장바구니 리스트
  totalItem: number;                              // 총 수량
  totalPrice: number;                             // 총 금액

  constructor(private modal: Modal,
              private cartService: CartService,
              private storage: StorageService,
              private alert: AlertService,
              private pagerService: PagerService,
              private spinner: SpinnerService,
              private searchBroker: SearchBroker,
              private addCartBroker: AddCartBroker,
              private searchAccountBroker: SearchAccountBroker,
              private logger: Logger,
              private renderer: Renderer2) {
    this.init();

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

    if (this.removeEntrySubscription) {
      this.removeEntrySubscription.unsubscribe();
    }

    if (this.removeCartSubscription) {
      this.removeCartSubscription.unsubscribe();
    }

    if (this.updateCartSubscription) {
      this.updateCartSubscription.unsubscribe();
    }
  }

  /**
   * 변수 초기화
   */
  private init() {
    this.cartList = new Array<CartEntry>();
    this.cartInfo = new CartInfo();
    this.accountInfo = null;
    this.searchParams = new SearchParam();
    this.productInfo = new CartEntry();
    this.currentCartList = new Array<CartEntry>();
    this.searchMode = 'A';
    this.currentPage = 0;
    this.totalItem = 0;
    this.totalPrice = 0;
    this.selectedCartNum = 0;
    this.modifyFlag =  false;
    this.pager = {};
  }

  /**
   * Search 모드 변경
   * @param mode
   */
  activeSearchMode(mode: string): void {
    this.searchMode = mode;
  }

  private activeRowCart(index: number): void {
    this.selectedCartNum = index;
  }

  /**
   * 검색 팝업 호출
   * @param searchText
   */
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

  /**
   * 유저정보 검색
   */
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

  /**
   * 제품 검색
   */
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

  /**
   * 비회원 가입 팝업
   */
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

  /**
   * 장바구니 생성
   */
  createCartInfo(): void {
    const terminalInfo = this.storage.getTerminalInfo();
    this.spinner.show();
    this.cartInfoSubscription = this.cartService.createCartInfo(this.accountInfo.uid,
                                                                this.accountInfo.uid,
                                                                terminalInfo.pointOfService.name , 'POS').subscribe(
      cartResult => {
        this.cartInfo = cartResult;
        this.updateVolumeAccount(this.cartInfo);
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('cartList.component', `Create cart info error type : ${errdata.type}`).error();
          this.logger.set('cartList.component', `Create cart info error message : ${errdata.message}`).error();
          this.alert.show({ alertType: AlertType.error, title: '오류', message: `${errdata.message}` });
        }
      },
      () => { this.spinner.hide(); }
    );
  }

  /**
   * Update VolumeAccount
   * @param cartInfo
   */
  updateVolumeAccount(cartInfo: CartInfo): void {
    this.spinner.show();
    this.updateVolumeAccountSubscription = this.cartService.updateVolumeAccount(this.cartInfo.user.uid,
                                                                                this.cartInfo.code,
                                                                                this.accountInfo.uid).subscribe(
      res => {
        this.logger.set('cartList.component', `update Volume Account status : ${res.status}`).debug();
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('cartList.component', `Update Volume Account error type : ${errdata.type}`).error();
          this.logger.set('cartList.component', `Update Volume Account error message : ${errdata.message}`).error();
          this.alert.show({ alertType: AlertType.error, title: '오류', message: `${errdata.message}` });
        }
      },
      () => { this.spinner.hide(); }
    );
  }

  /**
   * 장바구니 담기
   * @param code
   */
  addCartEntries(code: string): void {
    this.spinner.show();
    this.addCartSubscription = this.cartService.addCartEntries(this.cartInfo.user.uid, this.cartInfo.code, code).subscribe(
      result => {
        this.addCartModel = result;
        if (this.addCartModel[0].statusCode === 'success') {
        this.addCartModel.forEach(addModel => {
          this.productInfo.entryNumber = addModel.entry.entryNumber;
          this.productInfo.code = addModel.entry.product.code;
          this.productInfo.name = addModel.entry.product.name;
          this.productInfo.qty = addModel.entry.quantity;
          this.productInfo.price = addModel.entry.product.price.value;
          this.productInfo.desc = addModel.entry.product.description;

          this.addCartEntry(this.productInfo);
          });
        } else {
        this.modal.openMessage({
          title: '확인',
          message: this.addCartModel[0].statusMessage,
          closeButtonLabel: '닫기',
          closeByEnter: false,
          closeByEscape: true,
          closeByClickOutside: true,
          closeAllModals: true,
          modalId: 'ADD_CAR_ERROR'
        });
        }
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('cartList.component', `Add cart error type : ${errdata.type}`).error();
          this.logger.set('cartList.component', `Add cart error message : ${errdata.message}`).error();
          this.alert.show({ alertType: AlertType.error, title: '오류', message: `${errdata.message}` });
        }
      },
      () => { this.spinner.hide(); }
    );
  }

  /**
   * 주문 리스트 추가
   * @param cartEntry
   */
  addCartEntry(cartEntry: CartEntry) {
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
           qty: cartEntry.qty,
           price: cartEntry.price,
           desc: cartEntry.desc}
      );
    } else {
        this.cartList[existedIdx].qty = cartEntry.qty;
    }

    // 장바구니에 추가한 페이지로 이동
    this.setPage(Math.ceil(this.cartList.length / 10));
  }

  /**
   * 수량 업데이트
   * @param code
   * @param qty
   */
  updateItemQtyCart(code: string, qty: number): void {
    const index = this.cartList.findIndex(function (obj) {
      return obj.code === code;
    });

    this.spinner.show();
    this.updateCartSubscription = this.cartService.updateItemQuantityCart(this.cartInfo.user.uid,
                                                                      this.cartInfo.code,
                                                                      this.cartList[index].entryNumber,
                                                                      code,
                                                                      qty).subscribe(
      result => {
        this.updateCartModel = result;
        this.productInfo.entryNumber = this.updateCartModel.entry.entryNumber;
        this.productInfo.code = this.updateCartModel.entry.product.code;
        this.productInfo.name = this.updateCartModel.entry.product.name;
        this.productInfo.qty = this.updateCartModel.entry.quantity;
        this.productInfo.price = this.updateCartModel.entry.product.price.value;
        this.productInfo.desc = this.updateCartModel.entry.product.description;

        this.addCartEntry(this.productInfo);
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('cartList.component', `Update item quantity error type : ${errdata.type}`).error();
          this.logger.set('cartList.component', `Update item quantity error message : ${errdata.message}`).error();
          this.alert.show({ alertType: AlertType.error, title: '오류', message: `${errdata.message}` });
        }
      },
      () => { this.spinner.hide(); }
    );
  }

  /**
   * 장바구니 개별 삭제
   * @param code
   */
  removeItemCart(code: string): void {
    let index = this.cartList.findIndex(function (obj) {
      return obj.code === code;
    });

    this.spinner.show();
    this.removeEntrySubscription = this.cartService.deleteCartEntries(this.cartInfo.user.uid,
                                                                      this.cartInfo.code,
                                                                      this.cartList[index].entryNumber).subscribe(
      result => {
        this.cartList.splice(index, 1);

        index = index <= this.cartList.length ? index + 1 : index - 1;
        this.setPage(Math.ceil(index / 10));
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('cartList.component', `Remove item cart error type : ${errdata.type}`).error();
          this.logger.set('cartList.component', `Remove item cart error message : ${errdata.message}`).error();
          this.alert.show({ alertType: AlertType.error, title: '오류', message: `${errdata.message}` });
        }
      },
      () => { this.spinner.hide(); }
    );
  }

  /**
   * 장바구니 삭제
   */
  removeCart(): void {
    this.spinner.show();
    this.removeCartSubscription = this.cartService.deleteCart(this.cartInfo.user.uid, this.cartInfo.code).subscribe(
      result => {
        this.cartList.length = 0;
        this.currentCartList.length = 0;
        this.totalPriceInfo();
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('cartList.component', `Remove cart error type : ${errdata.type}`).error();
          this.logger.set('cartList.component', `Remove cart error message : ${errdata.message}`).error();
          this.alert.show({ alertType: AlertType.error, title: '오류', message: `${errdata.message}` });
        }
      },
      () => { this.spinner.hide(); }
    );
  }

  /**
   * 보류된 장바구니 리스트 가져오기
   */
  getCarts() {
    this.cartService.getCarts().subscribe();
  }

  /**
   * 장바구니 저장(보류)
   */
  saveCart() {
    this.spinner.show();
    this.cartService.saveCart(this.accountInfo.uid, this.cartInfo.user.uid, this.cartInfo.code).subscribe(
      result => {
        this.init();
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('cartList.component', `Save cart error type : ${errdata.type}`).error();
          this.logger.set('cartList.component', `Save cart error message : ${errdata.message}`).error();
          this.alert.show({ alertType: AlertType.error, title: '오류', message: `${errdata.message}` });
        }
      },
      () => { this.spinner.hide(); }
    );
  }

  /**
   * 보류된 장바구니 복원
   */
  restoreSavedCart() {
    this.cartService.restoreSavedCart(this.cartInfo.user.uid, this.cartInfo.code).subscribe();
  }

  /**
   * 출력 데이터 생성
   */
  setPage(page: number, pagerFlag: boolean = false) {
    if ((page < 1 || page > this.pager.totalPages) && pagerFlag) {
      return;
    }

    // pagination 생성 데이터 조회
    this.pager = this.pagerService.getPager(this.cartList.length, page);
    // 출력 리스트 생성
    this.totalPriceInfo();
    this.currentCartList = this.cartList.slice(this.pager.startIndex, this.pager.endIndex + 1);
  }

  /**
   * 가격정보 계산
   */
  totalPriceInfo(): void {
    let sumItem = 0;
    let sumPrice = 0;
    this.cartList.forEach(entry => {
      sumItem += entry.qty;
      sumPrice += entry.price * entry.qty;
    });

    this.totalItem = sumItem;
    this.totalPrice = sumPrice;
  }

  @HostListener('document: keydown', ['$event', '$event.target'])
  keyboardInput(event: any, targetElm: HTMLElement) {
    event.stopPropagation();   // event.preventDefault();

    if (this.selectedCartNum !== null && this.selectedCartNum < 10) {
      // 수정 이벤트
      if (event.keyCode === 45) {
        this.modifyFlag = !this.modifyFlag;
        this.updateItemQtyCart(this.currentCartList[this.selectedCartNum].code, event.keyCode);
      // 개별 삭제 이벤트
      } else if (event.keyCode === 46) {
        this.removeItemCart(this.currentCartList[this.selectedCartNum].code);
      }
    }

    // 보류
    if (event.keyCode === 38) {
      this.saveCart();
    }
  }
}
