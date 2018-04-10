import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { SpinnerService, SpinnerState } from './spinner.service';

@Component({
  moduleId: module.id,
  selector: 'pos-spinner',
  templateUrl: './spinner.component.html'
})
export class SpinnerComponent implements OnInit, OnDestroy {
  show: boolean;
  private spinnerState: Subscription;
  constructor(private spinnerSerive: SpinnerService) { }

  ngOnInit() {
    this.spinnerState = this.spinnerSerive.spinnerState.subscribe(
      (state: SpinnerState) => { this.show = state.show; } );
  }

  ngOnDestroy() {
    this.spinnerState.unsubscribe();
  }
}
