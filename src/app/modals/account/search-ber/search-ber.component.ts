import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ModalComponent, ModalService, Logger, AlertService } from '../../../core';
import { SearchService } from '../../../service';
import { BerData } from '../../../data/models/common/ber-result';
import { Utils } from '../../../core/utils';

@Component({
  selector: 'pos-search-ber',
  templateUrl: './search-ber.component.html'
})
export class SearchBerComponent extends ModalComponent implements OnInit, OnDestroy {
  berCount: number;
  berSeachMarker: number;
  berList: BerData[];
  private aboNum: string;
  private activeNum: number;                 // 선택 로우 번호
  private bersubscription: Subscription;
  @ViewChild('inputSearchBer') inputSearchBer: ElementRef;
  constructor(protected modalService: ModalService,
    private search: SearchService,
    private alert: AlertService,
    private logger: Logger) {
    super(modalService);
    this.berCount = 0;
    this.berSeachMarker = -1;
  }

  ngOnInit() {
    setTimeout(() => { this.inputSearchBer.nativeElement.focus(); }, 100); // 모달 팝업 포커스 보다 timeout을 더주어야 focus 잃지 않음.
    this.aboNum = this.callerData.aboNum;
  }

  ngOnDestroy() {
    if (this.bersubscription) { this.bersubscription.unsubscribe(); }
  }

  activeRow(index: number): void {
    this.activeNum = index;
  }

  reset() {
    this.berCount = 0;
    this.berSeachMarker = -1;
    if (this.berList) {
      this.berList.length = 0;
    }
    this.inputSearchBer.nativeElement.value = '';
  }

  getBerList() {
    const bername = this.inputSearchBer.nativeElement.value;
    if (Utils.isEmpty(bername)) {
      this.alert.warn({ message: `법인명이 공란입니다.` });
      return;
    }
    this.bersubscription = this.search.getBerSearch(bername, this.aboNum).subscribe(
      result => {
        if (result) {
          this.berCount = result.totalCount;
          this.berSeachMarker = result.totalCount;
          this.berList = result.result;
        }
      },
      error => {
        const errdata = Utils.getError(error);
        this.berSeachMarker = -1;
        if (errdata) {
          this.logger.set('search.ber.component', `search ber error type : ${errdata.type}`).error();
          this.logger.set('search.ber.component', `search ber error message : ${errdata.message}`).error();
          this.alert.error({ message: `${errdata.message}` });
        }
      });
  }

  close() {
    this.closeModal();
  }
}
