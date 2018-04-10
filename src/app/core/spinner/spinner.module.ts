import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpinnerService } from './spinner.service';
import { SpinnerComponent } from './spinner.component';
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
