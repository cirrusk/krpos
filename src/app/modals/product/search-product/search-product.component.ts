import { Component, ViewChild, ViewChildren, OnInit, AfterViewInit, Renderer2,
  ElementRef, ViewContainerRef, QueryList } from '@angular/core';

import { ModalComponent } from '../../../core/modal/modal.component';
import { ModalService } from '../../../service/pos';
import { Modal } from '../../../core/modal/modal';

import { SearchService } from '../../../service/order/search.service';
import Utils from '../../../core/utils';
import { AlertService } from '../../../core/alert/alert.service';
import { AlertType } from '../../../core/alert/alert-type.enum';
import { Products } from '../../../data/models/cart/cart-data';
import { Product } from '../../../data/model';

@Component({
  selector: 'pos-search-product',
  templateUrl: './search-product.component.html'
})
export class SearchProductComponent extends ModalComponent implements OnInit, AfterViewInit {

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
    private renderer: Renderer2) {
    super(modalService);
    this.basicSearchType = 'sku';
    this.bcdSearchType = '';
    this.productCount = -1;
    this.products = null;
    this.currentPage = 0;
  }

  ngOnInit() {
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

  private searchProduct() {
    const val = this.searchValue.nativeElement.value;
    if (Utils.isEmpty(val)) {
      this.alert.show({
        alertType: AlertType.warn,
        title: '확인',
        message: '검색어를 입력하십시오.'
      });
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

      } break;
      case 'vps': {

      } break;
      case 'prd': {
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
          }
        });
      } break;
    }
  }

  private searchProductByBarcode() {
    if (Utils.isNotEmpty(this.bcdSearchType)) {

    }
  }

  private productSelect() {
    let flag = false;
    for (const p of this.productItems) {
      let chk: boolean;
      chk = p.nativeElement.classList.contains('on');
      if (chk) {
        flag = true;
        break;
      }
    }
    if (!flag) {
      this.alert.show({
        alertType: AlertType.warn,
        title: '확인',
        message: '상품을 선택하십시오.'
      });
      return;
    }
    console.log(`selected product data, see below!!!\n\n${JSON.stringify(this.product, null, 2)}`);
  }

  searchOption(evt: any) {
    this.basicSearchType = evt.target.value;
  }

  searchBcdOption() {
    this.bcdSearchType = 'bcd';
  }

  private resetCurrentPage(evt: any) {
    if (this.currentPage > 0) { this.currentPage = 0; }
  }

  /**
   * 상품 선택 시 tr에 on클래스 추가
   * 상품 선택 시 해당 상품 데이터 추가
   *
   * @param index
   * @param product
   */
  private activeRow(index: number, product: Product): void {
    this.activeNum = index;
    this.product = product;
  }

  close() {
    this.closeModal();
  }

}
