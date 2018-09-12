import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ModalComponent, ModalService, Logger, AlertService, StorageService, Modal } from '../../../core';
import { SearchService, MessageService } from '../../../service';
import { BerData } from '../../../data/models/common/ber-result';
import { Utils } from '../../../core/utils';
import { ModalIds } from '../../../data';

/**
 * 중개주문 사업자등록증 조회 팝업
 */
@Component({
  selector: 'pos-search-ber',
  templateUrl: './search-ber.component.html'
})
export class SearchBerComponent extends ModalComponent implements OnInit, OnDestroy {
  berCount: number;
  berSeachMarker: number;
  berList: BerData[];
  private aboNum: string;
  activeNum: number;                 // 선택 로우 번호
  private bersubscription: Subscription;
  @ViewChild('inputSearchBer') inputSearchBer: ElementRef;
  constructor(protected modalService: ModalService,
    private search: SearchService,
    private modal: Modal,
    private storage: StorageService,
    private message: MessageService,
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

  activeRow(index: number, ber: BerData): void {
    this.activeNum = index;
    if (ber) {
      this.result = ber;
    }
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
          this.logger.set('search.ber.component', `search ber error message : ${errdata.message}`).error();
          this.alert.error({ message: this.message.get('server.error', errdata.message) });
        }
      });
  }

  setBer() {
    const ber: string = this.storage.getBer();
    const selectedber = this.result.number;
    if (Utils.isNotEmpty(ber) && Utils.isNotEmpty(selectedber)) {
      if (ber === selectedber) {
        this.modal.openConfirm({
          title: '중개 주문 진행 취소',
          message: `중개 주문 진행을 취소하시겠습니까?<br>주문종류가 일반주문으로 변경됩니다.`,
          modalAddClass: 'pop_s',
          actionButtonLabel: '확인',
          closeButtonLabel: '취소',
          closeByEnter: true,
          closeByClickOutside: false,
          beforeCloseCallback: function () {
            if (this.isEnter) {
              this.result = this.isEnter;
            }
          },
          modalId: ModalIds.CANCELBER
        }).subscribe(res => {
          if (res) {
            this.storage.removeBer();
            this.result = new BerData();
          }
          this.close();
        });
      } else {
        this.close();
      }
    } else {
      this.close();
    }
  }

  close() {
    this.closeModal();
  }
}
