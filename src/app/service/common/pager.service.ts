import { Injectable } from '@angular/core';
import { Pagination } from '../../data';

@Injectable()
export class PagerService {
  private pagination: Pagination;

  constructor() {
    this.pagination = new Pagination();
   }

  getPager(totalItems: number, currentPage: number = 1, pageSize: number = 8): Pagination {
    // 총 페이지 수
    const totalPages = Math.ceil(totalItems / pageSize);

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
}
