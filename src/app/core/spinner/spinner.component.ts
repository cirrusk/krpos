import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { SpinnerService, SpinnerState } from '../service/spinner.service';

@Component({
  moduleId: module.id,
  selector: 'pos-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnInit, OnDestroy {
  show = false;
  message = '';
  private spinnerState: Subscription;
  constructor(private spinnerSerive: SpinnerService) { }

  ngOnInit() {
    this.spinnerState = this.spinnerSerive.spinnerState.subscribe(
      (state: SpinnerState) => {
        this.show = state.show;
        if (state.message) { this.message = state.message; }
      } );
  }

  ngOnDestroy() {
    this.spinnerState.unsubscribe();
  }
}
