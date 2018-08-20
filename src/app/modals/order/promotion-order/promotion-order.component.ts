import { Component, OnInit, ViewChildren, QueryList, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService, Logger } from '../../../core';
import { SearchService } from '../../../service';
import { Product } from '../../../data';
import { Utils } from '../../../core/utils';

/**
 * 프로모션 상품 컴포넌트
 * 비닐봉투 소/대의 Product code는 environment에서 조회.
 */
@Component({
  selector: 'pos-promotion-order',
  templateUrl: './promotion-order.component.html'
})
export class PromotionOrderComponent extends ModalComponent implements OnInit, OnDestroy {

  @ViewChildren('promotions') promotions: QueryList<ElementRef>;
  promotionProducts: Array<Product>;
  private pageSize: number;
  private startIndex: number;
  private endIndex: number;
  private currentPage: number;
  private totalPages: number;
  private totalCount: number;
  private startPage: number;
  private endPage: number;
  private promotionsubscription: Subscription;
  constructor(protected modalService: ModalService,
    private search: SearchService,
    private logger: Logger,
    private renderer: Renderer2) {
    super(modalService);
    this.currentPage = 1;
    this.promotionProducts = new Array<Product>();
    this.pageSize = 9;
  }

  ngOnInit() {
    this.getPromotionProducts(0);

  }

  ngOnDestroy() {
    if (this.promotionsubscription) { this.promotionsubscription.unsubscribe(); }
  }

  /**
   * 프로모션 상품 목록 가져오기
   * 상품명 / 상품코드
   */
  private getPromotionProducts(pagenum: number) {
    this.promotionsubscription = this.search.getFavoriteProducts().subscribe(
      result => {
        this.promotionProducts = result.products;
        this.totalCount = result.totalProductCount;
        this.totalPages = result.totalPageCount;
        this.currentPage = result.currentPage;
        this.paging(this.totalCount, pagenum, this.pageSize);
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('promotion.order.component', `${errdata.message}`).error();
        }
      });
  }

  setPage(pagenum: number) {
    if (pagenum < 0 || pagenum > this.totalPages - 1) { return; }
    this.paging(this.totalCount, pagenum, this.pageSize);
    this.getPromotionProducts(pagenum);
  }

  /**
   * 일반 프로모션 상품
   * @param {any} evt 이벤트
   * @param {Product} product 상품정보
   */
  promotion(evt: any, product: Product) {
    this.setSelected(evt);
    console.log(`product code : ${product.code}`);
    this.result = product.code;
    this.close();
  }

  /**
   * @ignore
   */
  close() {
    this.closeModal();
  }

  private paging(totalCount: number, currentPage: number = 1, pageSize: number = 9): void {
    // 총 페이지 수
    const totalPages = Math.ceil(totalCount / pageSize);
    // 페이지 설정
    this.startPage = 0;
    this.pageSize = pageSize;
    this.endPage = totalPages - 1;
    this.totalPages = totalPages;
    // 출력 index
    this.startIndex = (currentPage - 1) * pageSize;
    this.endIndex = Math.min(this.startIndex + pageSize - 1, totalCount - 1);
    // Item 설정
    this.totalCount = totalCount;
    this.currentPage = currentPage;
  }

  /**
   * @ignore
   * @param evt 이벤트
   */
  private setSelected(evt: any) {
    evt.stopPropagation();
    this.promotions.forEach(promotion => {
      parent = this.renderer.parentNode(promotion.nativeElement);
      this.renderer.removeClass(parent, 'on');
      this.renderer.removeClass(promotion.nativeElement, 'on');
    });
    parent = this.renderer.parentNode(evt.target);
    this.renderer.addClass(parent, 'on');
    this.renderer.addClass(evt.target, 'on');
  }

}
