import { Component, OnInit } from '@angular/core';
import { LockType } from '../data';
import { StorageService } from '../core';

@Component({
  selector: 'pos-order',
  templateUrl: './order.component.html'
})
export class OrderComponent implements OnInit {

  constructor(private storage: StorageService) { }

  ngOnInit() {
     // 장바구니 추가 시 클라이언트에 장바구니 데이터 전송
     // 빈값을 한번 던져서 최초 이벤트를 발생시킴.
    this.storage.setOrderEntry(null);
  }

}
