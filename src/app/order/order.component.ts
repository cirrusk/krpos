import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import { LockType } from '../data';
import { StorageService } from '../core';

@Component({
  selector: 'pos-order',
  templateUrl: './order.component.html'
})
export class OrderComponent implements OnInit {
  public noticeList: string[] = [];
  public promotionList: any[] = [];
  constructor(private storage: StorageService, private route: ActivatedRoute) { }

  ngOnInit() {
    // 장바구니 추가 시 클라이언트에 장바구니 데이터 전송
    // 빈값을 한번 던져서 최초 이벤트를 발생시킴.
    this.storage.setOrderEntry(null);
    // resolver 에서 전달해준 값을 받아 cart list에 전달하여 공지사항 출력
    const data = this.route.snapshot.data['notice'];
    // 일반 공지
    this.noticeList = data[0];
    // resolver 에서 전달해준 값을 받아 cart menu에 전달하여 프로모션 출력
    // api 가 다른 경우 resolver를 하나 더 만듬.
    // 프로모션 공지
    this.promotionList = data[1];
  }

}
