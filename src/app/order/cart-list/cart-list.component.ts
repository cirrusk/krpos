import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { SearchAccountComponent, NewAccountComponent, SearchProductComponent, HoldOrderComponent } from '../../modals';
import { Modal, StorageService, AlertService, AlertType, SpinnerService, Logger } from '../../core';

import { CartService, PagerService } from '../../service';
import { SearchBroker, SearchAccountBroker, RestoreCartBroker, CancleOrderBroker, AddCartBroker, InfoBroker } from '../../broker';
import { Accounts, SearchParam, CartInfo, CartModification, SaveCartResult, OrderEntry } from '../../data';
import { Cart } from '../../data/models/order/cart';

import { TotalPrice } from './../../data/models/cart/cart-data';
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
  private restoreCartSubscription: Subscription;
  private cancleCartSubscription: Subscription;
  private cartListSubscription: Subscription;

  private searchParams: SearchParam;              // 조회 파라미터
  private cartInfo: CartInfo;                     // 장바구니 기본정보
  private productInfo: OrderEntry;                 // 제품 정보
  private addCartModel: CartModification[];       // 장바구니 담기 응답모델
  private updateCartModel: CartModification;      // 장바구니 수정 응답모델
  private currentPage: number;                    // 현재 페이지 번호
  private pager: any = {};                        // pagination 정보
  private selectedCartNum: number;                // 선택된 카트번호
  private modifyFlag: boolean;                    // 수정 버튼 플래그
  private saveCartResult: SaveCartResult;         // 장바구니 복원 응답 모델

  accountInfo: Accounts;                          // 사용자 정보
  searchMode: string;                             // 조회 모드
  cartList: Array<OrderEntry>;                     // 장바구니 리스트
  currentCartList: Array<OrderEntry>;              // 출력 장바구니 리스트
  totalItem: number;                              // 총 수량
  totalPrice: number;                             // 총 금액
  totalPV: number;                                // 총 PV
  totalBV: number;                                // 총 Bv

  constructor(private modal: Modal,
              private cartService: CartService,
              private storage: StorageService,
              private alert: AlertService,
              private pagerService: PagerService,
              private spinner: SpinnerService,
              private searchBroker: SearchBroker,
              private addCartBroker: AddCartBroker,
              private searchAccountBroker: SearchAccountBroker,
              private restoreCartBroker: RestoreCartBroker,
              private cancleOrderBroker: CancleOrderBroker,
              private infoBroker: InfoBroker,
              private logger: Logger) {
    this.init();

    this.accountInfoSubscription = this.searchAccountBroker.getInfo().subscribe(
      result => {
        if (result) {
          this.accountInfo = result;
          this.getCarts();
        }
      }
    );

    this.productSubscription = this.addCartBroker.getInfo().subscribe(
      productInfo => {
        if (productInfo) {
          this.addToCart(productInfo.code);
        }
      }
    );

    this.restoreCartSubscription = this.restoreCartBroker.getInfo().subscribe(
      result => {
        if (result) {
          this.accountInfo = result.volumeABOAccount;
          this.cartInfo.code = result.code;
          this.cartInfo.user = result.user;
          this.cartInfo.volumeABOAccount = result.volumeABOAccount;
          this.cartInfo.guid = result.guid;
          this.restoreSavedCart();
        }
      }
    );

    this.cancleCartSubscription = this.cancleOrderBroker.getInfo().subscribe(
      result => {
        if (result === 'delCart') {
          this.removeCart();
        }
      }
    );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.accountInfoSubscription) { this.accountInfoSubscription.unsubscribe(); }
    if (this.updateVolumeAccountSubscription) { this.updateVolumeAccountSubscription.unsubscribe(); }
    if (this.addCartSubscription) { this.addCartSubscription.unsubscribe(); }
    if (this.removeEntrySubscription) { this.removeEntrySubscription.unsubscribe(); }
    if (this.removeCartSubscription) { this.removeCartSubscription.unsubscribe(); }
    if (this.updateCartSubscription) { this.updateCartSubscription.unsubscribe(); }
    if (this.restoreCartSubscription) { this.restoreCartSubscription.unsubscribe(); }
    if (this.cancleCartSubscription) { this.cancleCartSubscription.unsubscribe(); }
    if (this.cartListSubscription) { this.cartListSubscription.unsubscribe(); }
  }

  /**
   * 변수 초기화
   */
  private init() {
    this.cartList = new Array<OrderEntry>();
    this.cartInfo = new CartInfo();
    this.accountInfo = null;
    this.searchParams = new SearchParam();
    this.productInfo = new OrderEntry();
    this.currentCartList = new Array<OrderEntry>();
    this.searchMode = 'A';
    this.currentPage = 0;
    this.totalItem = 0;
    this.totalPrice = 0;
    this.totalPV = 0;
    this.totalBV = 0;
    this.selectedCartNum = 0;
    this.modifyFlag =  false;
    this.pager = {};
    this.saveCartResult = new SaveCartResult();
  }

  /**
   * Search 모드 변경
   * @param mode
   */
  activeSearchMode(mode: string): void {
    this.searchMode = mode;
  }

  /**
   * 현재 선택한 로우
   * @param index
   */
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
      this.searchBroker.sendInfo('account', this.searchParams);
    // 제품 검색
    } else {
      this.callSearchProduct();
      this.searchBroker.sendInfo('product', this.searchParams);
    }
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
   * 보류 내역 조회
   * 보류 건수가 존재 하지 않을 경우 띄우지 않음.
   */
  holdOrder() {
    this.modal.openModalByComponent(HoldOrderComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByEnter: false,
        closeByEscape: true,
        closeByClickOutside: false,
        closeAllModals: false,
        modalId: 'HoldOrderComponent'
      }
    );
  }

  /**
   * 장바구니 생성
   *  - 제품 추가시 생성
   */
  createCartInfo(productCode?: string): void {
    const terminalInfo = this.storage.getTerminalInfo();
    this.spinner.show();
    this.cartInfoSubscription = this.cartService.createCartInfo(this.accountInfo.uid,
                                                                this.accountInfo.uid,
                                                                terminalInfo.pointOfService.name , 'POS').subscribe(
      cartResult => {
        this.cartInfo = cartResult;
        this.updateVolumeAccount(this.cartInfo);
        if (productCode) {
          this.addCartEntries(productCode);
        }
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
   * 현재 장바구니 조회
   * @param page
   */
  getCartList(page?: number): void {
    this.spinner.show();
    this.cartListSubscription = this.cartService.getCartList(this.cartInfo.user.uid, this.cartInfo.code).subscribe(
      result => {
        this.cartList = result.entries;
        this.setPage(page ? page : Math.ceil(this.cartList.length / 10));
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
   * 장바구니 담기 function
   * @param code
   */
  addToCart(code: string): void {
    if (this.cartList.length === 0) {
      this.createCartInfo(code);
    } else {
      this.addCartEntries(code);
    }
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
          this.productInfo = addModel.entry;
          this.addCartEntry(this.productInfo);
          });
        } else {
          let appendMessage = '';
          this.addCartModel[0].messages.forEach(message => {
            if (message.severity === 'ERROR') {
              if (appendMessage === '' ) {
                appendMessage += message.message;
              } else {
                appendMessage += '\r\n' + message.message;
              }
            }
          });

          this.modal.openMessage({
            title: '확인',
            message: appendMessage,
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
   * @param orderEntry
   */
  addCartEntry(orderEntry: OrderEntry) {
    const existedIdx: number = this.cartList.findIndex(
      function (obj) {
        return obj.product.code === orderEntry.product.code;
      }
    );

    // 리스트에 없을 경우
    if (existedIdx === -1) {
      this.cartList.push(orderEntry);
    } else {
        this.cartList[existedIdx] = orderEntry;
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
      return obj.product.code === code;
    });
    this.spinner.show();
    this.updateCartSubscription = this.cartService.updateItemQuantityCart(this.cartInfo.user.uid,
                                                                      this.cartInfo.code,
                                                                      this.cartList[index].entryNumber,
                                                                      code,
                                                                      qty).subscribe(
      result => {
        this.addCartEntry(result.entry);
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
    const index = this.cartList.findIndex(function (obj) {
      return obj.product.code === code;
    });

    this.spinner.show();
    this.removeEntrySubscription = this.cartService.deleteCartEntries(this.cartInfo.user.uid,
                                                                      this.cartInfo.code,
                                                                      this.cartList[index].entryNumber).subscribe(
      result => {
        this.getCartList(index < 10 ? 1 : Math.ceil(index / 10));
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
        this.init();
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
    this.spinner.show();
    this.cartService.getCarts(this.accountInfo.uid).subscribe(
      result => {
        if (result.carts.length > 0) {
          this.holdOrder();
        }
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('cartList.component', `Get Carts error type : ${errdata.type}`).error();
          this.logger.set('cartList.component', `Get Carts error message : ${errdata.message}`).error();
          this.alert.show({ alertType: AlertType.error, title: '오류', message: `${errdata.message}` });
        }
      },
      () => { this.spinner.hide(); }
    );
  }

  /**
   * 장바구니 저장(보류)
   */
  saveCart() {
    this.spinner.show();
    this.cartService.saveCart(this.accountInfo.uid, this.cartInfo.user.uid, this.cartInfo.code).subscribe(
      result => {
        console.log({}, result);
        this.init();
        this.infoBroker.sendInfo('hold', 'add');
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
    this.spinner.show();
    this.cartService.restoreSavedCart(this.cartInfo.user.uid, this.cartInfo.code).subscribe(
      result => {
        this.saveCartResult = result;
        this.setCartInfo(this.saveCartResult.savedCartData);
        this.infoBroker.sendInfo('hold', 'add');
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('cartList.component', `Restore saved cart error type : ${errdata.type}`).error();
          this.logger.set('cartList.component', `Restore saved cart error message : ${errdata.message}`).error();
          this.alert.show({ alertType: AlertType.error, title: '오류', message: `${errdata.message}` });
        }
      },
      () => { this.spinner.hide(); }
    );
  }

  /**
   * 장바구니 복원 데이터 설정
   * @param cartData
   */
  setCartInfo(cartData: Cart): void {
    this.cartList.length = 0;

    // 카트 리스트
    this.cartList = cartData.entries;

    this.cartInfo.code = cartData.code;
    this.cartInfo.user = cartData.user;
    this.cartInfo.volumeABOAccount = cartData.volumeABOAccount;
    this.cartInfo.guid = cartData.guid;
    this.setPage(Math.ceil(this.cartList.length / 10));
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
    let sumPV = 0;
    let sumBV = 0;

    this.cartList.forEach(entry => {
      sumItem += entry.quantity;
      sumPrice += entry.product.price.value * entry.quantity;
      sumPV += entry.totalPrice.amwayValue.pointValue;
      sumBV += entry.totalPrice.amwayValue.businessVolume;
    });

    this.totalItem = sumItem;
    this.totalPrice = sumPrice;
    this.totalPV = sumPV;
    this.totalBV = sumBV;
  }

  @HostListener('document: keydown', ['$event', '$event.target'])
  keyboardInput(event: any, targetElm: HTMLElement) {
    event.stopPropagation();   // event.preventDefault();

    if (this.selectedCartNum !== null && this.selectedCartNum < 10) {
      // 수정 이벤트
      // 임시
      if (event.keyCode === 45) {
        this.modifyFlag = !this.modifyFlag;
        this.updateItemQtyCart(this.currentCartList[this.selectedCartNum].product.code, event.keyCode);
      // 개별 삭제 이벤트
      // 임시
      } else if (event.keyCode === 46) {
        this.removeItemCart(this.currentCartList[this.selectedCartNum].product.code);
      }
    }

    // 보류 리스트 업
    // 임시
    if (event.keyCode === 38) {
      this.getCarts();
    }

    // 저장 라이트
    // 임시
    if (event.keyCode === 39) {
      this.saveCart();
    }

    // 복원 다운
    // 임시
    if (event.keyCode === 40) {
      this.restoreSavedCart();
    }
  }
}
