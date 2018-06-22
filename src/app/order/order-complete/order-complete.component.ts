import { Component, OnInit, ElementRef, ViewChild, Renderer2, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { OrderList } from './../../data/models/order/order';
import { Pagination, OrderHistoryList, OrderHistory } from '../../data';
import { PagerService, MessageService, OrderService } from '../../service';
import { Modal, Logger, SpinnerService, AlertService } from '../../core';
import { Utils } from '../../core/utils';
import { Subscription } from 'rxjs/Subscription';
import { OrderDetailComponent } from '../../modals/order/order-detail/order-detail.component';

@Component({
  selector: 'pos-order-complete',
  templateUrl: './order-complete.component.html'
})
export class OrderCompleteComponent implements OnInit, OnDestroy {

  private orderListSubscription: Subscription;

  orderHistoryList: OrderHistoryList;
  selectedOrderNum: number;
  searchType: string;

  @ViewChild('inputSearchText') private searchText: ElementRef;

  constructor(private router: Router,
              private modal: Modal,
              private orderService: OrderService,
              private spinner: SpinnerService,
              private alert: AlertService,
              private messageService: MessageService,
              private renderer: Renderer2,
              private logger: Logger) {
    this.init();

  }

  ngOnInit() {
    setTimeout(() => { this.searchText.nativeElement.focus(); }, 100); // 모달 팝업 포커스 보다 timeout을 더주어야 focus 잃지 않음.
  }

  ngOnDestroy() {
    if (this.orderListSubscription) { this.orderListSubscription.unsubscribe(); }
  }

  init() {
    this.orderHistoryList = new OrderHistoryList();
    this.orderHistoryList.orders =  new Array<OrderHistory>();
    this.orderHistoryList.pagination = new Pagination();
    this.selectedOrderNum = -1;
    this.searchType = 'abo';
  }

  setSearchType (type: string) {
    this.searchType = type;
  }

  activeRowCart(index: number, orderCode: string, userId: string): void {
    this.selectedOrderNum = index;
    this.popupOrderDetail(orderCode, userId);
  }

  popupOrderDetail(orderCode: string, userId: string) {
    this.modal.openModalByComponent(OrderDetailComponent,
      {
        callerData: { orderCode: orderCode, userId: userId },
        actionButtonLabel: '선택',
        closeButtonLabel: '취소',
        modalId: 'OrderDetailComponent'
      }
    );
  }

  searchOrder(memberType: string, searchText: string) {
    if (searchText === '' || searchText === undefined || searchText === null) {
      this.alert.info({ message: this.messageService.get('noSearchText') });
    } else {
      this.getOrderList(this.searchType, memberType, searchText);
    }
  }

  getOrderList(searchType: string, memberType: string, searchText: string) {
    this.spinner.show();
    this.orderListSubscription = this.orderService.orderList(searchText, 'NORMAL_ORDER', 'pos', 'pickup').subscribe(
      resultData => {
        if (resultData) {
          this.orderHistoryList = resultData;
        }
      },
      error => {
        this.spinner.hide();
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('order-complete.component', `Get order list error type : ${errdata.type}`).error();
          this.logger.set('order-complete.component', `Get order list error message : ${errdata.message}`).error();
          this.alert.error({ message: `${errdata.message}` });
        }
      },
      () => { this.spinner.hide(); }
    );
  }

  goOrder() {
    this.router.navigate(['/order']);
  }
}
