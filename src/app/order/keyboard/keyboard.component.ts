import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { KeyboardService, Logger, KeyCommand } from '../../core';

@Component({
  selector: 'pos-keyboard',
  templateUrl: './keyboard.component.html'
})
export class KeyboardComponent implements OnInit, OnDestroy {

  private keyboardsubscription: Subscription;
  @Output() public keyMenuAction: EventEmitter<any> = new EventEmitter<any>();
  @Output() public keyCartAction: EventEmitter<any> = new EventEmitter<any>();
  constructor(private keyboard: KeyboardService,
    private logger: Logger) { }

  ngOnInit() {
    this.keyboardsubscription = this.keyboard.commands.subscribe(c => {
      this.handleKeyboardCommand(c);
    });
  }

  ngOnDestroy() {
    if (this.keyboardsubscription) { this.keyboardsubscription.unsubscribe(); }
  }

  protected doPickUp(evt: any) {
    this.keyMenuAction.emit({ action: 'pickup' });
  }

  protected entryDelete(evt: any) {
    this.keyCartAction.emit({ action: 'entrydel'});
  }

  protected updateQty(evt: any) {
    this.keyCartAction.emit({ action: 'updateqty'});
  }

  protected doHold(evt: any) {
    this.keyCartAction.emit({ action: 'dohold'});
  }

  protected searchAccount(evt: any) {
    this.keyCartAction.emit({ action: 'searchaccount'});
  }

  protected searchProduct(evt: any) {
    this.keyCartAction.emit({ action: 'searchproduct'});
  }

  protected doOrderCancel(evt: any) {
    this.keyMenuAction.emit({ action: 'ordercancel'});
  }

  protected doOpenDrawer(evt: any) {
    this.keyCartAction.emit({ action: 'opendrawer'});
  }

  protected doGroupOrder(evt: any) {
    this.keyMenuAction.emit({ action: 'grouporder'});
  }

  protected doCard(evt: any) {
    this.keyMenuAction.emit({ action: 'card'});
  }

  protected doIc(evt: any) {
    this.keyMenuAction.emit({ action: 'ic'});
  }

  protected doPoint(evt: any) {
    this.keyMenuAction.emit({ action: 'point'});
  }

  protected doDebit(evt: any) {
    this.keyMenuAction.emit({ action: 'debit'});
  }

  protected doRecash(evt: any) {
    this.keyMenuAction.emit({ action: 'recash'});
  }

  protected doCash(evt: any) {
    this.keyMenuAction.emit({ action: 'cash'});
  }

  protected doMediator(evt: any) {
    this.keyMenuAction.emit({ action: 'mediator'});
  }

  protected doClearInput(evt: any) {
    if (evt.target.tagName === 'INPUT') {
      this.keyCartAction.emit({ action: 'clear'});
    }
  }

  protected doEtc(evt: any) {
    this.keyMenuAction.emit({ action: 'etc'});
  }

  protected doCoupon(evt: any) {
    this.keyMenuAction.emit({ action: 'coupon'});
  }

  /**
   * 비닐봉투(대)
   * 비닐봉투(소)
   * 그룹주문
   * 보류/보류해제
   * 픽업주문  ctrl+alt+p
   * 단품취소  shift+del
   * 회원조회
   * 환전
   * 상품조회
   * 주문취소
   * CLEAR
   * 수량변경
   * Enter
   * 현금
   * Re-Cash
   * 신용카드
   * A포인트
   * 현금IC
   * M포인트
   * 자동이체
   * 수표조회
   * ←
   * ESC
   * Page Up
   * Page Down
   *
   * @param command 키보드 이벤트 커멘드
   */
  private handleKeyboardCommand(command: KeyCommand) {
    try {
      this.logger.set('keyboard.component', `[${command.combo}] key event, [${command.name}] function!`).debug();
      this[command.name](command.ev);
      // switch (command.combo) {
      //   case 'ctrl+r': { this[command.name](); } break;
      // }
    } catch (e) {
      this.logger.set('keyboard.component', `[${command.combo}] key event, [${command.name}] undefined function!`).error();
    }
  }
}
