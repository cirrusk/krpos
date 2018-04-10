import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlertComponent } from './alert.component';
import { AlertService } from '../service/alert.service';
import { AlertDirective } from './alert.directive';
import { throwIfAlreadyLoaded } from '../module-import-guard';

@NgModule({
  imports: [CommonModule],
  exports: [AlertComponent],
  declarations: [AlertComponent, AlertDirective],
  providers: [AlertService]
})
export class AlertModule {
  constructor(@Optional() @SkipSelf() parentModule: AlertModule) {
    throwIfAlreadyLoaded(parentModule, 'AlertModule');
  }
}
