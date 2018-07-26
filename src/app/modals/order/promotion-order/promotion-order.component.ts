import { Component, OnInit, ViewChildren, QueryList, ElementRef, Renderer2 } from '@angular/core';
import { ModalComponent, ModalService, Config } from '../../../core';

@Component({
  selector: 'pos-promotion-order',
  templateUrl: './promotion-order.component.html'
})
export class PromotionOrderComponent extends ModalComponent implements OnInit {

  @ViewChildren('promotions') promotions: QueryList<ElementRef>;
  promotionProducts: Array<string>;
  pageSize: number;
  startIndex: number;
  endIndex: number;
  currentPage: number;
  totalCount: number;
  startPage: number;
  endPage: number;
  constructor(protected modalService: ModalService,
    private config: Config,
    private renderer: Renderer2) {
    super(modalService);
    this.currentPage = 1;
    this.promotionProducts = new Array<string>();
  }

  ngOnInit() {
    this.getPromotionProducts();

  }

  private getPromotionProducts() {
    this.promotionProducts = [
      '100099A',
      '100106M',
      '100099A',
      '100106M',
      // '100099A',
      // '100106M',
      // '100099A',
      // '100106M',
      // '100106M',
      // '100106M',
      // '100106M',
      // '100099A',
      // '100106M',
      // '100106M',
      // '100106M',
      // '100106M', '100099A', '100106M', '100106M', '100106M',
      // '100106M', '100099A', '100106M', '100106M', '100106M',
      // '100106M', '100099A', '100106M', '100106M', '100106M'
    ];

    this.totalCount = this.promotionProducts.length + 2;
    // 페이지 사이즈
    this.pageSize = 9; // Math.floor(totalProduct / 9);
    // 총 페이지 수
    const totalPages = Math.ceil(this.totalCount / 9);
    this.startIndex = (this.currentPage - 1);
    this.endIndex = Math.min(totalPages, this.totalCount - 1);
    this.startPage = 1;
    this.endPage = totalPages;
  }

  prevPaging() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
    this.startIndex = (this.currentPage - 1) * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize - 1, this.totalCount - 1);
  }

  nextPaging() {
    if (this.currentPage < this.endPage) {
      this.currentPage++;
    }
    this.startIndex = (this.currentPage - 1) * this.pageSize - 1;
    this.endIndex = Math.min(this.startIndex + this.pageSize - 1, this.totalCount - 1) - 1;
  }

  promotionBasic(evt: any, type: string) {
    this.setSelected(evt);
    let bagProductCode = '';
    if (type === 'b') { // 비니루봉투 대
      bagProductCode = this.config.getConfig('bigBagCode');
    } else if (type === 's') { // 비닐봉투 소
      bagProductCode = this.config.getConfig('smallBagCode');
    }
    this.result = bagProductCode;
    this.close();
  }

  promotion(evt: any, productcode: string) {
    this.setSelected(evt);
    console.log(`product code : ${productcode}`);
    this.result = productcode;
    this.close();
  }

  checkPaging(idx: number) {
    const sidx = (this.currentPage - 1) * 9;
    const eidx = (this.currentPage * 9 - 1);
    // if (this.currentPage === this.endPage) {
    //   // eidx = eidx - 2;
    // }
    if (idx >= sidx && idx <= eidx) {
      return true;
    }
    return false;
  }

  close() {
    this.closeModal();
  }

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
