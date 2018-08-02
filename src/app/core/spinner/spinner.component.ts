import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/delay';
import { SpinnerService, SpinnerState } from './spinner.service';

/**
 * Spinner 컴포넌트
 * 카드 결재 등에 사용할 경우 기본인 "통신중입니다." 아이콘 사용
 * 그외에 API 처리용인 경우 "로딩중입니다." 아이콘이 적절함.
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
  constructor(private spinnerSerive: SpinnerService) {
    this.loadingIcon = 'loading.gif';
  }

  ngOnInit() { // 2018.05.03 ExpressionChangedAfterItHasBeenCheckedError 처리 delay
    this.spinnerState = this.spinnerSerive.spinnerState.delay(10).subscribe(
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

}
