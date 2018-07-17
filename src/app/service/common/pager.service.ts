import { Injectable } from '@angular/core';
import { Pagination } from '../../data';

@Injectable()
export class PagerService {
  private pagination: Pagination;

  constructor() {}

  /**
   * pagination 생성
   * @param totalItems
   * @param currentPage
   * @param pageSize
   */
  getPager(totalItems: number, currentPage: number = 1, pageSize: number = 8): Pagination {
    // 총 페이지 수
    const totalPages = Math.ceil(totalItems / pageSize);

    this.pagination = new Pagination();

    // 페이지 설정
    this.pagination.startPage = 1;
    this.pagination.pageSize = pageSize;
    this.pagination.endPage = totalPages;
    this.pagination.totalPages = totalPages;

    // 출력 index
    this.pagination.startIndex = (currentPage - 1) * pageSize;
    this.pagination.endIndex = Math.min(this.pagination.startIndex + pageSize - 1, totalItems - 1);

    // Item 설정
    this.pagination.totalItems = totalItems;
    this.pagination.currentPage = currentPage;

    return this.pagination;
  }

  /**
   * 현재 페이지 생성
   * @param totalList
   * @param page
   * @param pageSize
   */
  getCurrentPage(totalList: any, page: number, pageSize: number): Map<string, object> {
    // pagination 생성 데이터 조회
    const pager = this.getPager(totalList.length, page, pageSize);
    // 출력 리스트 생성
    const list = totalList.slice(pager.startIndex, pager.endIndex + 1);
    const listMap = new Map<string, object>().set('pager', pager)
                                             .set('list', list);
    return listMap;
  }
}
