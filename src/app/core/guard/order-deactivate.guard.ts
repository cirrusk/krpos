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
    state: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    if (component.isCheck()) {
      return true;
    } else {
      this.logger.set('order.deactivate.guard[route]', `${route}`).debug();
      this.logger.set('order.deactivate.guard[state]', `${state}`).debug();
      this.logger.set('order.deactivate.guard[nextState]', `${nextState}`).debug();
      // return confirm('결제 진행중입니다. 계속 진행하시겠습니까?');
      return true;
    }
  }
}
