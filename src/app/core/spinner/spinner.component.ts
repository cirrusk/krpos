import { SpinnerService, SpinnerState } from './../service/spinner.service';
import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'pos-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnInit, OnDestroy {
  show = false;
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
