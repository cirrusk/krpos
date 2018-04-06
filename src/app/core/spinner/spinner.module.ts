import { SpinnerService } from './../service/spinner.service';
import { SpinnerComponent } from './spinner.component';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { throwIfAlreadyLoaded } from '../module-import-guard';

@NgModule({
  imports: [CommonModule],
  exports: [SpinnerComponent],
  declarations: [SpinnerComponent],
  providers: [SpinnerService]
})
export class SpinnerModule {
  constructor(@Optional() @SkipSelf() parentModule: SpinnerModule) {
    throwIfAlreadyLoaded(parentModule, 'SpinnerModule');
  }
}
