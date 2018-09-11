import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('restictPanel', { read: ElementRef }) restictPanel: ElementRef;
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
    setTimeout(() => { this.restictPanel.nativeElement.focus(); });
  }

  /**
   * 출력 데이터 생성
   * @param {number} page 페이지번호
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

  /**
   * 이미지 오류 처리하기
   * @param evt 이벤트
   */
  errorImgHandler(evt: any) {
    evt.target.src = '/assets/images/temp/198x198.jpg';
  }

  close() {
    this.closeModal();
  }
}
