import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { OrderComponent } from '../../order/order.component';
import { Logger } from '../logger/logger';

@Injectable()
export class OrderDeactivateGuard implements CanDeactivate<OrderComponent> {

  constructor(private logger: Logger) { }
  canDeactivate(
    component: OrderComponent,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

      this.logger.set('order.deactivate.guard', `${state.url}`).debug();

      return true;
  }
}
