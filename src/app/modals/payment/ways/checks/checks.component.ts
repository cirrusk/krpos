import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import * as moment from 'moment';

import { ModalComponent, ModalService, Logger, StorageService, SpinnerService } from '../../../../core';
import { PaymentService, MessageService } from '../../../../service';
import { Utils, StringBuilder } from '../../../../core/utils';
import { StatusDisplay, KeyCode, ModalIds } from '../../../../data';

@Component({
  selector: 'pos-checks',
  templateUrl: './checks.component.html'
})
export class ChecksComponent extends ModalComponent implements OnInit, OnDestroy {
  check: number;
  apprmessage: string;
  finishStatus: string;                             // 결제완료 상태
  private regex: RegExp = /[^0-9]+/g;
  private allowedChars = new Set('0123456789'.split('').map(c => c.charCodeAt(0)));
  private checksubscription: Subscription;
  private dupcheck = false;
  @ViewChild('checkyr') checkyr: ElementRef;            // 년
  @ViewChild('checkmm') checkmm: ElementRef;            // 월
  @ViewChild('checkdd') checkdd: ElementRef;            // 일
  @ViewChild('checkno') checkno: ElementRef;            // 수표번호
  @ViewChild('checkpoint') checkpoint: ElementRef;      // 발행점,발행지점 지로코드
  @ViewChild('checkvalcode') checkvalcode: ElementRef;  // 검증코드
  @ViewChild('checktype') checktype: ElementRef;        // 수표종류
  @ViewChild('checkprice') checkprice: ElementRef;      // 수표금액
  @ViewChild('checkpopup') checkpopup: ElementRef;      // 팝업

  // spinnerService 는 HostListener 사용중
  constructor(protected modalService: ModalService, private payments: PaymentService, private message: MessageService,
    private storage: StorageService, private spinnerService: SpinnerService, private logger: Logger) {
    super(modalService);
    this.finishStatus = null;
    this.check = 0;
  }

  ngOnInit() {
    setTimeout(() => { this.checkyr.nativeElement.focus(); }, 50);
  }

  ngOnDestroy() {
    if (this.checksubscription) { this.checksubscription.unsubscribe(); }
  }

  init() {
    this.finishStatus = null;
    this.check = 0;
    this.apprmessage = '';
    this.dupcheck = false;
    this.checkyr.nativeElement.value = '';
    this.checkmm.nativeElement.value = '';
    this.checkdd.nativeElement.value = '';
    this.checkno.nativeElement.value = '';
    this.checkpoint.nativeElement.value = '';
    this.checkvalcode.nativeElement.value = '';
    this.checktype.nativeElement.value = '';
    this.checkprice.nativeElement.value = '';
    setTimeout(() => { this.checkyr.nativeElement.focus(); }, 50);
  }

  checks() {
    const VALID_LEN = 41; // 길이 포함 (3 + 38)
    if (!this.validValue()) {
      this.check = -10;
      this.apprmessage = this.message.get('check.invalid.value'); // '수표 입력 정보가 부정확합니다.';
      this.dupcheck = false;
      return;
    }
    if (!this.validDate()) {
      this.check = -9;
      this.apprmessage = this.message.get('check.invalid.date'); // '발행일 정보가 부정확합니다.';
      this.dupcheck = false;
      return;
    }
    this.check = 0;
    const checknum = this.makeCheckNumber();
    this.logger.set('checks.component', `수표 번호 : ${checknum}`).debug();
    if (checknum.length === VALID_LEN) {
      this.checksubscription = this.payments.searchCheque(checknum).subscribe(
        result => {
          if (result && result.result === 'true') {
            this.finishStatus = StatusDisplay.PAID;
            this.apprmessage = this.message.get('check.success');
          } else {
            this.finishStatus = 'fail';
            this.apprmessage = this.message.get('check.fail');
            this.dupcheck = false;
          }
        },
        error => {
          this.logger.set('checks.component', `${error}`).error();
          this.finishStatus = 'fail';
          this.apprmessage = this.message.get('check.fail');
          this.dupcheck = false;
        });
    } else {
      this.logger.set('checks.component', `잘못된 수표 번호 : ${checknum}, 길이 : ${checknum.length - 3}`).error();
      this.finishStatus = 'fail';
      this.apprmessage = this.message.get('check.fail.valid');
      this.dupcheck = false;
    }
  }

  /**
   * 수표 번호 조합
   *
   * 038(길이) + 지로코드 (6자리) + 년(2자리) + 월(2자리) + 일(2자리) + 수표번호(8자리) + 수표종류(2자리) + 수표금액 (10자리, 10자리 미만시 오른쪽에 0 추가) + 검증코드(6자리)
   */
  private makeCheckNumber(): string {
    let yr = this.checkyr.nativeElement.value.replace(this.regex, '');        // 년(2자리)
    const mm = this.checkmm.nativeElement.value.replace(this.regex, '');      // 월(2자리)
    const dd = this.checkdd.nativeElement.value.replace(this.regex, '');      // 일(2자리)
    const no = this.checkno.nativeElement.value.replace(this.regex, '');      // 수표번호(8자리)
    const cd = this.checkpoint.nativeElement.value.replace(this.regex, '');   // 지로코드 (6자리)
    const vl = this.checkvalcode.nativeElement.value.replace(this.regex, ''); // 검증코드(6자리)
    const tp = this.checktype.nativeElement.value.replace(this.regex, '');    // 수표종류(2자리)
    let pr = this.checkprice.nativeElement.value.replace(this.regex, '');   // 수표금액 (10자리, 10자리 미만시 왼쪽에 0 추가)
    yr = yr.substring(2, 4);
    pr = Utils.padLeft(pr, '0', 10);

    let ch = '';
    ch = ch.concat(cd); // 지로코드 (6자리)
    ch = ch.concat(yr); // 년(2자리)
    ch = ch.concat(mm); // 월(2자리)
    ch = ch.concat(dd); // 일(2자리)
    ch = ch.concat(no); // 수표번호(8자리)
    ch = ch.concat(tp); // 수표종류(2자리)
    ch = ch.concat(pr); // 수표금액 (10자리, 10자리 미만시 오른쪽에 0 추가)
    ch = ch.concat(vl); // 검증코드(6자리)

    const chheader = Utils.padLeft(String(ch.length), '0', 3); // 038(길이)
    return chheader.concat(ch);
  }

  private validValue(): boolean {
    const yr = this.checkyr.nativeElement.value.replace(this.regex, '');
    if (Utils.isEmpty(yr) || yr.length !== 4) {
      setTimeout(() => { this.checkyr.nativeElement.select(); this.checkyr.nativeElement.focus(); }, 100);
      return false;
    }
    const mm = this.checkmm.nativeElement.value.replace(this.regex, '');
    if (Utils.isEmpty(mm) || mm.length !== 2) {
      setTimeout(() => { this.checkmm.nativeElement.select(); this.checkmm.nativeElement.focus(); }, 100);
      return false;
    }
    const dd = this.checkdd.nativeElement.value.replace(this.regex, '');
    if (Utils.isEmpty(dd) || dd.length !== 2) {
      setTimeout(() => { this.checkdd.nativeElement.select(); this.checkdd.nativeElement.focus(); }, 100);
      return false;
    }
    const no = this.checkno.nativeElement.value.replace(this.regex, '');
    if (Utils.isEmpty(no) || no.length !== 8) {
      setTimeout(() => { this.checkno.nativeElement.select(); this.checkno.nativeElement.focus(); }, 100);
      return false;
    }
    const cd = this.checkpoint.nativeElement.value.replace(this.regex, '');
    if (Utils.isEmpty(cd) || cd.length !== 6) {
      setTimeout(() => { this.checkpoint.nativeElement.select(); this.checkpoint.nativeElement.focus(); }, 100);
      return false;
    }
    const vl = this.checkvalcode.nativeElement.value.replace(this.regex, '');
    if (Utils.isEmpty(vl) || vl.length !== 6) {
      setTimeout(() => { this.checkvalcode.nativeElement.select(); this.checkvalcode.nativeElement.focus(); }, 100);
      return false;
    }
    const tp = this.checktype.nativeElement.value.replace(this.regex, '');
    if (Utils.isEmpty(tp) || tp.length !== 2) {
      setTimeout(() => { this.checktype.nativeElement.select(); this.checktype.nativeElement.focus(); }, 100);
      return false;
    }
    const pr = this.checkprice.nativeElement.value.replace(this.regex, '');
    if (Utils.isEmpty(pr)) {
      setTimeout(() => { this.checkprice.nativeElement.select(); this.checkprice.nativeElement.focus(); }, 100);
      return false;
    }
    return true;
  }

  private validDate(): boolean {
    const yr = this.checkyr.nativeElement.value.replace(this.regex, '');
    const mm = this.checkmm.nativeElement.value.replace(this.regex, '');
    const dd = this.checkdd.nativeElement.value.replace(this.regex, '');
    let rtn = moment(yr + mm + dd, 'YYYYMMDD').isValid();
    if (!rtn) {
      rtn = moment(yr, 'YYYY').isValid();
      if (!rtn) {
        setTimeout(() => { this.checkyr.nativeElement.select(); this.checkyr.nativeElement.focus(); }, 100);
        return false;
      }
      rtn = moment(mm, 'MM').isValid();
      if (!rtn) {
        setTimeout(() => { this.checkmm.nativeElement.select(); this.checkmm.nativeElement.focus(); }, 100);
        return false;
      }
      rtn = moment(dd, 'DD').isValid();
      if (!rtn) {
        setTimeout(() => { this.checkdd.nativeElement.select(); this.checkdd.nativeElement.focus(); }, 100);
        return false;
      }
      return true;
    }
    return true;
  }


  checkYr(evt: KeyboardEvent) {
    if (evt.keyCode > 31 && !this.allowedChars.has(evt.keyCode)) {
      evt.preventDefault();
    }
    const yr = this.checkyr.nativeElement.value.replace(this.regex, '');
    if (Utils.isEmpty(yr) || yr.length !== 4) {
      this.check = -1;
      this.apprmessage = this.message.get('check.invalid.yr'); // '발행 년도를 정확히 입력하세요.';
      this.dupcheck = false;
    } else {
      this.check = 0;
    }
  }

  checkYrNext() {
    const yr = this.checkyr.nativeElement.value.replace(this.regex, '');
    if (Utils.isNotEmpty(yr) && yr.length === 4) {
      this.check = 0;
      setTimeout(() => { this.checkmm.nativeElement.focus(); }, 50);
    }
  }

  checkMm(evt: KeyboardEvent) {
    if (evt.keyCode > 31 && !this.allowedChars.has(evt.keyCode)) {
      evt.preventDefault();
    }
    const mm = this.checkmm.nativeElement.value.replace(this.regex, '');
    if (Utils.isEmpty(mm) || mm.length !== 2) {
      this.check = -2;
      this.apprmessage = this.message.get('check.invalid.mm'); // '발행 월을 정확히 입력하세요.';
      this.dupcheck = false;
    } else {
      this.check = 0;
    }
  }

  checkMmNext() {
    const mm = this.checkmm.nativeElement.value.replace(this.regex, '');
    if (Utils.isNotEmpty(mm) && mm.length === 2) {
      this.check = 0;
      setTimeout(() => { this.checkdd.nativeElement.focus(); }, 50);
    }
  }

  checkDd(evt: KeyboardEvent) {
    if (evt.keyCode > 31 && !this.allowedChars.has(evt.keyCode)) {
      evt.preventDefault();
    }
    const dd = this.checkdd.nativeElement.value;
    if (Utils.isEmpty(dd) || dd.length !== 2) {
      this.check = -3;
      this.apprmessage = this.message.get('check.invalid.dd'); // '발행 일을 정확히 입력해주세요.';
      this.dupcheck = false;
    } else {
      this.check = 0;
    }
  }

  checkDdNext() {
    const dd = this.checkdd.nativeElement.value.replace(this.regex, '');
    if (Utils.isNotEmpty(dd) && dd.length === 2) {
      this.check = 0;
      setTimeout(() => { this.checkno.nativeElement.focus(); }, 50);
    }
  }

  checkNo(evt: KeyboardEvent) {
    if (evt.keyCode > 31 && !this.allowedChars.has(evt.keyCode)) {
      evt.preventDefault();
    }
    const no = this.checkno.nativeElement.value.replace(this.regex, '');
    if (Utils.isEmpty(no) || no.length !== 8) {
      this.check = -4;
      this.apprmessage = this.message.get('check.invalid.no'); // '수표번호를 정확히 입력해주세요.';
      this.dupcheck = false;
    } else {
      this.check = 0;
    }
  }

  checkNoNext() {
    const no = this.checkno.nativeElement.value.replace(this.regex, '');
    if (Utils.isNotEmpty(no) && no.length === 8) {
      this.check = 0;
      setTimeout(() => { this.checkpoint.nativeElement.focus(); }, 50);
    }
  }

  checkPoint(evt: KeyboardEvent) {
    if (evt.keyCode > 31 && !this.allowedChars.has(evt.keyCode)) {
      evt.preventDefault();
    }
    const point = this.checkpoint.nativeElement.value.replace(this.regex, '');
    if (Utils.isEmpty(point) || point.length !== 6) {
      this.check = -5;
      this.apprmessage = this.message.get('check.invalid.point'); // '발행점,발행지점 지로코드를 정확히 입력해주세요.';
      this.dupcheck = false;
    } else {
      this.check = 0;
    }
  }

  checkPointNext() {
    const point = this.checkpoint.nativeElement.value.replace(this.regex, '');
    if (Utils.isNotEmpty(point) && point.length === 6) {
      this.check = 0;
      setTimeout(() => { this.checkvalcode.nativeElement.focus(); }, 50);
    }
  }

  checkValCode(evt: KeyboardEvent) {
    if (evt.keyCode > 31 && !this.allowedChars.has(evt.keyCode)) {
      evt.preventDefault();
    }
    const valcode = this.checkvalcode.nativeElement.value.replace(this.regex, '');
    if (Utils.isEmpty(valcode) || valcode.length !== 6) {
      this.check = -6;
      this.apprmessage = this.message.get('check.invalid.code'); // '검증코드를 정확히 입력해주세요.';
      this.dupcheck = false;
    } else {
      this.check = 0;
    }
  }

  checkValCodeNext() {
    const valcode = this.checkvalcode.nativeElement.value.replace(this.regex, '');
    if (Utils.isNotEmpty(valcode) && valcode.length === 6) {
      this.check = 0;
      setTimeout(() => { this.checktype.nativeElement.focus(); }, 50);
    }
  }

  checkType(evt: KeyboardEvent) {
    if (evt.keyCode > 31 && !this.allowedChars.has(evt.keyCode)) {
      evt.preventDefault();
    }
    const type = this.checktype.nativeElement.value.replace(this.regex, '');
    if (Utils.isEmpty(type) || type.length !== 2) {
      this.check = -7;
      this.apprmessage = this.message.get('check.invalid.type'); // '수표종류를 정확히 입력해주세요.';
      this.dupcheck = false;
    } else {
      this.check = 0;
    }
  }

  checkTypeNext() {
    const type = this.checktype.nativeElement.value.replace(this.regex, '');
    if (Utils.isNotEmpty(type) && type.length === 2) {
      this.check = 0;
      setTimeout(() => { this.checkprice.nativeElement.focus(); }, 50);
    }
  }

  checkPrice(evt: KeyboardEvent) {
    if (evt.keyCode > 31 && !this.allowedChars.has(evt.keyCode)) {
      evt.preventDefault();
    }
    const price = this.checkprice.nativeElement.value.replace(this.regex, '');
    if (Utils.isEmpty(price)) {
      this.dupcheck = false;
      this.check = -8;
      this.apprmessage = this.message.get('check.invalid.price');
      this.dupcheck = false;
    } else {
      this.check = 0;
    }
  }

  checkPriceNext() {
    const price = this.checkprice.nativeElement.value.replace(this.regex, '');
    if (Utils.isNotEmpty(price)) {
      this.check = 0;
    }
  }

  checkPriceFinal() {
    const price = this.checkprice.nativeElement.value.replace(this.regex, '');
    if (Utils.isNotEmpty(price)) {
      this.check = 0;
      if (!this.dupcheck) {
        setTimeout(() => { this.checks(); }, 300);
        this.dupcheck = true;
      }
    }
  }

  close() {
    setTimeout(() => {
      this.checkpopup.nativeElement.focus();
      this.closeModal();
    }, 100);
  }

  private payFinishByEnter() {
    this.result = this.checkprice.nativeElement.value.replace(this.regex, '');
    this.close();
  }

  @HostListener('document:keydown', ['$event', 'this.spinnerService.status()'])
  onChecksKeyBoardDown(event: any, isSpinnerStatus: boolean) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER && !isSpinnerStatus) {
      const lastmodal = this.storage.getLatestModalId();
      if (lastmodal === ModalIds.CHECKS) {
        if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
          this.payFinishByEnter();
        } else {
          if (!this.dupcheck) {
            setTimeout(() => { this.checks(); }, 300);
            this.dupcheck = true;
          }
        }
      }
    }
  }

}
