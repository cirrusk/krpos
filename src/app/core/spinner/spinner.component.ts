import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/delay';
import { SpinnerService, SpinnerState } from './spinner.service';

@Component({
  moduleId: module.id,
  selector: 'pos-spinner',
  templateUrl: './spinner.component.html'
})
export class SpinnerComponent implements OnInit, OnDestroy {
  @Input() show: boolean;
  private spinnerState: Subscription;
  constructor(private spinnerSerive: SpinnerService) { }

  ngOnInit() { // 2018.05.03 ExpressionChangedAfterItHasBeenCheckedError 처리 delay
    this.spinnerState = this.spinnerSerive.spinnerState.delay(10).subscribe(
      async (state: SpinnerState) => { this.show = state.show; } );
  }

  ngOnDestroy() {
    if (this.spinnerState) { this.spinnerState.unsubscribe(); }
  }

}
