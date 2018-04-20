import { Component, OnInit } from '@angular/core';

import { PosModalService } from './../../core/modal/pos-modal.service';
import { Product, OrderParams, OrderEntries } from '../../data/model';

@Component({
  selector: 'pos-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  private macAddress: string;
  bodyText: string;
  constructor(private modalService: PosModalService) { }

  ngOnInit() {

    let o1: OrderEntries;
    o1 = new OrderEntries(new Product('A111111'), '10');

    let o2: OrderEntries;
    o2 = new OrderEntries(new Product('B111111'), '7');

    const oa: OrderEntries[] = [];
    oa.push(o1);
    oa.push(o2);

    let op: OrderParams;
    op = new OrderParams(oa);
    // op.orderEntries = oa;

    console.log('################## Add to Cart Parameter JSON ###################### ' + JSON.stringify(op));

  }

  private getMACAddress() {
  }

  public openModal(id: string) {
    this.modalService.open(id);
  }

  public closeModal(id: string ) {
    this.modalService.close(id);
  }

  public loadMacAddress() {
  }

}
