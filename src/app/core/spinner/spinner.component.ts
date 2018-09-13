import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/delay';
import { SpinnerService, SpinnerState } from './spinner.service';
import { KeyCode } from '../../data';

/**
 * Spinner 컴포넌트
 * 카드 결재 등에 사용할 경우 기본인 "통신중입니다." 아이콘 사용
 * 그외에 API 처리용인 경우 "로딩중입니다." 아이콘이 적절함.
 * 결제등 모달 창에서 ESCAPE 키로 모달창을 빠져나갈 경우
 * Spinner가 남아있을 경우가 있으므로 ESCAPE 이벤트가 발생할 경우 닫아주도록함.
 */
@Component({
  moduleId: module.id,
  selector: 'pos-spinner',
  templateUrl: './spinner.component.html'
})
export class SpinnerComponent implements OnInit, OnDestroy {
  @Input() show: boolean;
  private spinnerState: Subscription;
  loadingIcon: string;
  constructor(private spinner: SpinnerService) {
    this.loadingIcon = 'loading.gif';
  }

  ngOnInit() { // 2018.05.03 ExpressionChangedAfterItHasBeenCheckedError 처리 delay
    this.spinnerState = this.spinner.spinnerState.delay(10).subscribe(
      async (state: SpinnerState) => {
        this.show = state.show;
        if (state.iconType && state.iconType === 'c') { // content loading
          this.loadingIcon = 'loading.gif';
        }
      });
  }

  ngOnDestroy() {
    if (this.spinnerState) { this.spinnerState.unsubscribe(); }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyBoardDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ESCAPE) {
      setTimeout(() => { this.spinner.hide(); }, 100);
    }
  }

}
