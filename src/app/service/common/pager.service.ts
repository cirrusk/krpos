import { Injectable } from '@angular/core';
import * as _ from 'underscore';

@Injectable()
export class PagerService {
  constructor() { }

  getPager(totalItems: number, currentPage: number = 1, pageSize: number = 10) {
    // 총 페이지 수
    const totalPages = Math.ceil(totalItems / pageSize);

    let startPage: number, endPage: number;

    startPage = 1;
    endPage = totalPages;

    // 출력 index
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex
    };
  }
}
