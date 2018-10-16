import {
  Component, ViewChild, ViewChildren, OnInit, AfterViewInit, Renderer2,
  ElementRef, QueryList, OnDestroy, Input
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ModalComponent, ModalService, AlertService, Logger, Modal } from '../../../core';
import { SearchService } from '../../../service/order/search.service';
import { Product, Products } from '../../../data/models/cart/cart-data';
import { Utils } from '../../../core/utils';
import { CartInfo } from './../../../data/models/order/cart-info';
import { SerialComponent } from '../../scan/serial/serial.component';
import { MessageService } from '../../../service';
import { ModalIds } from '../../../data';

@Component({
  selector: 'pos-search-product',
  templateUrl: './search-product.component.html'
})
export class SearchProductComponent extends ModalComponent implements OnInit, AfterViewInit, OnDestroy {

  private searchSubscription: Subscription;
  private spsubscription: Subscription;
  private cartInfo: CartInfo;
  private userId: string;

  @ViewChild('searchValue') private searchValue: ElementRef;
  @ViewChild('searchPrev', { read: ElementRef }) private searchPrev: ElementRef;
  @ViewChild('searchNext', { read: ElementRef }) private searchNext: ElementRef;
  @ViewChild('inputRadioSKU') radioSKU: ElementRef;
  @ViewChildren('productRows') private productRows: QueryList<ElementRef>;
  @Input() chkSearchTypeSKU = true;
  searchType: string;
  productCount: number;
  products: Products;
  product: Product;
  activeNum: number;
  currentPage: number;
  totalPages: number;
  productItems: any;
  searchData: string;
  constructor(protected modalService: ModalService,
    private modal: Modal,
    private search: SearchService,
    private message: MessageService,
    private alert: AlertService,
    private logger: Logger,
    private renderer: Renderer2) {
    super(modalService);
    this.searchType = 'sku';
    this.productCount = -1;
    this.products = null;
    this.currentPage = 0;
    this.searchData = '';
  }

  ngOnInit() {
    setTimeout(() => { this.searchValue.nativeElement.focus(); }, 100); // 모달 팝업 포커스 보다 timeout을 더주어야 focus 잃지 않음.
    const result = this.callerData.data;
    this.searchValue.nativeElement.value = result.searchText.trim();
    this.cartInfo = result.data;
    this.userId = result.userId;
    if (result.searchText.trim()) {
      this.searchData = result.searchText.trim();
      this.searchProduct(result.searchText.trim()); // 전달 받은 데이터로 검색
    }
  }

  ngOnDestroy() {
    if (this.searchSubscription) { this.searchSubscription.unsubscribe(); }
    if (this.spsubscription) { this.spsubscription.unsubscribe(); }
  }

  init() {
    this.searchValue.nativeElement.value = '';
    setTimeout(() => { this.searchValue.nativeElement.focus(); }, 100); // 모달 팝업 포커스 보다 timeout을 더주어야 focus 잃지 않음.
    this.searchType = 'sku';
    this.radioSKU.nativeElement.checked = 'checked';
    this.productCount = -1;
    this.products = null;
    this.currentPage = 0;
  }

  ngAfterViewInit() {
    this.productRows.changes.subscribe(() => {
      this.productItems = this.productRows.toArray();
    });
  }

  /**
   * 이전페이지 이동
   */
  prev() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.searchProduct();
    }
  }

  /**
   * 다음페이지 이동
   */
  next() {
    if ((this.totalPages - 1) > this.currentPage) {
      this.currentPage++;
      this.searchProduct();
    }
  }

  /**
   * 상품 조회시 saleStatus 가
   * SOLDOUT    : 일시품절
   * ENDOFSALE  : 단종
   * OUTOFSTOCK : 재고없음
   * 인 경우는 재고 수량란에  "일시품절", 단종 으로 텍스트 표시하고, 선택 disable
   * 1) 프로모션은 모두 노출
   * 2) "일시품절", "단종", "재고 없음 if (stock - safety stock == 0)"
   */
  searchProduct(searchText?: string, cartInfo?: CartInfo) {
    if (searchText && searchText.trim()) {
      this.searchData = searchText.trim();
      this.searchValue.nativeElement.value = searchText.trim();
      this.currentPage = 0;
    } else {
      searchText = this.searchData;
    }
    const val: string = searchText ? searchText.trim() : (this.searchValue.nativeElement.value).trim();
    const sval = val.toUpperCase();
    if (Utils.isEmpty(sval)) {
      this.alert.warn({ message: '검색어를 입력하십시오.', timer: true, interval: 1500 });
      setTimeout(() => { this.searchValue.nativeElement.focus(); this.searchValue.nativeElement.select(); }, 1550);
      return;
    }
    if (this.productItems) {
      this.activeNum = -1;
      for (const p of this.productItems) {
        this.renderer.removeClass(p.nativeElement, 'on');
      }
    }
    this.spsubscription = this.search.getBasicProductInfoByCart(this.searchType, sval, this.cartInfo.user.uid, this.cartInfo.code, this.currentPage).subscribe(
      data => {
        this.products = data;
        this.productCount = data.pagination.totalResults;
        this.totalPages = data.pagination.totalPages;
        setTimeout(() => { this.searchValue.nativeElement.focus(); this.searchValue.nativeElement.select(); }, 100);
        if (this.totalPages > 1) {
          if (this.currentPage === 0) { // 첫페이지
            this.renderer.removeClass(this.searchPrev.nativeElement, 'on');
            this.renderer.addClass(this.searchNext.nativeElement, 'on');
          } else {
            if ((this.totalPages - 1) === this.currentPage) { // 마지막 페이지
              this.renderer.addClass(this.searchPrev.nativeElement, 'on');
              this.renderer.removeClass(this.searchNext.nativeElement, 'on');
            } else {
              this.renderer.addClass(this.searchPrev.nativeElement, 'on');
              this.renderer.addClass(this.searchNext.nativeElement, 'on');
            }
          }
        } else {
          this.renderer.removeClass(this.searchPrev.nativeElement, 'on');
          this.renderer.removeClass(this.searchNext.nativeElement, 'on');
        }
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('searchProduct.component', `Search product error type : ${errdata.type}`).error();
          this.logger.set('searchProduct.component', `Search product error message : ${errdata.message}`).error();
          this.alert.error({ message: this.message.get('server.error', errdata.message) });
        }
      });
  }

  /**
   * 검색 Type 저장
   * 바코드가 입력된 상태에서 바코드 스캔하면 기존 값과 중복됨.
   * @param evt
   */
  searchOption(evt: any) {
    this.searchType = evt.target.value;
    this.searchValue.nativeElement.value = '';
    setTimeout(() => { this.searchValue.nativeElement.focus(); }, 100);
  }

  /**
   * 현재 페이지 초기화
   * @param evt
   */
  resetCurrentPage(evt: any) {
    if (this.currentPage > 0) { this.currentPage = 0; }
  }

  /**
   * 상품 선택 시 tr에 on클래스 추가
   * 상품 선택 시 해당 상품 데이터 추가
   * 상품 조회시 saleStatus 가
   * SOLDOUT    : 일시품절
   * ENDOFSALE  : 단종
   * OUTOFSTOCK : 재고없음
   * 인 경우는 재고 수량란에  "일시품절", 단종 으로 텍스트 표시하고, 선택 disable
   * 1) 프로모션은 모두 노출
   * 2) "일시품절", "단종", "재고 없음 if (stock - safety stock == 0)"
   *
   * @param index
   * @param product
   */
  activeRow(index: number, product: Product): void {
    if (product.sellableStatusForStock !== undefined) {
      this.activeNum = -1;
      this.product = null;
    } else {
      this.activeNum = index;
      this.product = product;
      // RFID, SERIAL 입력 받음.
      if (product && (product.rfid || product.serialNumber)) {
        this.modal.openModalByComponent(SerialComponent, {
          callerData: { productInfo: product, userId: this.userId},
          closeByClickOutside: false,
          modalId: ModalIds.SERIAL
        }).subscribe(data => {
          // 검색팝업이 닫힐때 SERIAL 받기(cart-list.component)
          if (data) {
            this.result = { productCode: this.product.code, serialNumbers: data.serialNumbers };
            this.close();
          } else {
            this.activeNum = -1;
            this.product = null;
          }
        });
      } else {
        this.result = { productCode: this.product.code, serialNumber: '' };
        this.close();
      }
    }
  }

  close() {
    this.closeModal();
  }

}
