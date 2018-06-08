import { Component, OnInit } from '@angular/core';
import { ModalComponent, ModalService, Modal } from '../../../core';
import { RestrictionModel, Pagination } from '../../../data';
import { PagerService } from '../../../service';

@Component({
  selector: 'pos-restrict',
  templateUrl: './restrict.component.html'
})
export class RestrictComponent extends ModalComponent implements OnInit {
  image: string;
  message: string;
  desc: string;
  private restrictionMessageList: Array<RestrictionModel>;
  private pager: Pagination;                        // pagination 정보
  restrictionModel: RestrictionModel;

  constructor(protected modalService: ModalService,
              private pagerService: PagerService) {
    super(modalService);
    this.pager = new Pagination();
  }

  ngOnInit() {
    this.restrictionMessageList = this.callerData.data;
    this.setPage(1);
  }

  /**
   * 출력 데이터 생성
   */
  setPage(page: number) {
    if (page < 1 || page > this.pager.totalPages) {
      return;
    }

    // pagination 생성 데이터 조회
    this.pager = this.pagerService.getPager(this.restrictionMessageList.length, page, 1);

    // 출력 리스트 생성
    this.restrictionModel = this.restrictionMessageList[this.pager.startIndex];
  }

  close() {
    this.closeModal();
  }
}
