import { Component, ViewChild, ViewChildren, OnInit, AfterViewInit, Renderer2,
  ElementRef, ViewContainerRef, QueryList, OnDestroy } from '@angular/core';

import { ModalComponent } from '../../../core/modal/modal.component';
import { ModalService } from '../../../service/pos';
import { Modal } from '../../../core/modal/modal';

import { SearchService } from '../../../service/order/search.service';
import { AlertService } from '../../../core/alert/alert.service';
import { AlertType } from '../../../core/alert/alert-type.enum';
import { Products } from '../../../data/models/cart/cart-data';
import { Product } from '../../../data/models/cart/cart-data';
import { SpinnerService } from '../../../core/spinner/spinner.service';
import { AddCartBroker } from '../../../broker/order/cart/add-cart.broker';

import Utils from '../../../core/utils';
import { SearchBroker } from '../../../broker/order/search/search.broker';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'pos-search-product',
  templateUrl: './search-product.component.html'
})
export class SearchProductComponent extends ModalComponent implements OnInit, AfterViewInit, OnDestroy {

  private searchSubscription: Subscription;

  @ViewChild('searchValue') private searchValue: ElementRef;
  @ViewChild('searchPrev', {read: ElementRef}) private searchPrev: ElementRef;
  @ViewChild('searchNext', {read: ElementRef}) private searchNext: ElementRef;
  @ViewChildren('productRows') private productRows: QueryList<ElementRef>;
  basicSearchType: string;
  bcdSearchType: string;
  productCount: number;
  products: Products;
  product: Product;
  activeNum: number;
  currentPage: number;
  totalPages: number;
  productItems: any;
  constructor(protected modalService: ModalService,
    private search: SearchService,
    private alert: AlertService,
    private spinner: SpinnerService,
    private addCartBroker: AddCartBroker,
    private searchBroker: SearchBroker,
    private renderer: Renderer2) {
    super(modalService);
    this.basicSearchType = 'sku';
    this.bcdSearchType = '';
    this.productCount = -1;
    this.products = null;
    this.currentPage = 0;

    this.searchSubscription = this.searchBroker.getInfo().subscribe(
      result => {
        if (result.data.searchText.trim() && result.type === 'product') {
          this.searchValue.nativeElement.value = result.data.searchText;
          // 전달 받은 데이터로 검색
          this.searchProduct(result.data.searchText);
        }
      }
    );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.productRows.changes.subscribe(() => {
      this.productItems = this.productRows.toArray();
    });
  }

  prev() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.searchProduct();
    }
  }

  next() {
    if (this.totalPages >= this.currentPage) {
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
  searchProduct(searchText?: string) {
    const val = searchText ? searchText : this.searchValue.nativeElement.value;
    if (Utils.isEmpty(val)) {
      this.alert.show({ alertType: AlertType.warn, title: '확인', message: '검색어를 입력하십시오.' });
      return;
    }
    if (this.productItems) {
      this.activeNum = -1;
      for (const p of this.productItems) {
        this.renderer.removeClass(p.nativeElement, 'on');
      }
    }
    switch (this.basicSearchType) {
      case 'sku': {
        this.spinner.show();
        this.search.getBasicProductInfo(val, this.currentPage).subscribe(data => {
          this.products = data;
          this.productCount = data.pagination.totalResults;
          this.totalPages = data.pagination.totalPages;
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
        error => {},
        () => { this.spinner.hide(); }
       );
      } break;
      case 'vps': {

      } break;
      case 'prd': {

      } break;
    }
  }

  searchProductByBarcode() {
    if (Utils.isNotEmpty(this.bcdSearchType)) {

    }
  }

  productSelect() {
    let flag = false;
    for (const p of this.productItems) {
      const chk = p.nativeElement.classList.contains('on');
      if (chk) { flag = true; break; }
    }
    if (!flag) {
      this.alert.show({ alertType: AlertType.warn, title: '확인', message: '상품을 선택하십시오.' });
      return;
    }
    this.addCartBroker.sendInfo(this.product);
    this.close();
  }

  searchOption(evt: any) {
    this.basicSearchType = evt.target.value;
  }

  searchBcdOption() {
    this.bcdSearchType = 'bcd';
  }

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
    this.activeNum = index;
    this.product = product;
  }

  close() {
    this.closeModal();
  }

}
