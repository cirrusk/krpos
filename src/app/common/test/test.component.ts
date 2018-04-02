
import { Component, OnInit } from '@angular/core';

import { PosModalService } from './../../core/service/pos-modal.service';

@Component({
  selector: 'pos-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  private macAddress: string;
  constructor(private modalService: PosModalService) { }

  ngOnInit() {
    // this.getMACAddress();
  }

  private getMACAddress() {
    // this.networkService.wait().subscribe(
    //     () => {
    //         this.macAddress = this.networkService.getLocalMacAddress();
    //     }
    // );
  }

  public openModal(id: string) {
    this.modalService.open(id);
  }

  public closeModal(id: string ) {
    this.modalService.close(id);
  }

  public loadMacAddress() {
    // this.macAddress = this.networkService.getLocalMacAddress();
  }

}
