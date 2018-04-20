import { LockType } from './../../common/header/header.component';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { StorageService, Logger } from '../../service/pos';

@Injectable()
export class OrderGuard implements CanActivate, CanActivateChild {

  constructor(private storage: StorageService, private router: Router, private logger: Logger) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    let redictCheck = false;
    const lockType = this.storage.getScreenLockType();
    const batchinfo = this.storage.getBatchInfo();
    if (lockType === LockType.LOCK) {
      this.logger.set({n: 'order.guard', m: 'pos is locked!!!'}).debug();
      redictCheck = true;
    }
    if (batchinfo === null) {
      this.logger.set({n: 'order.guard', m: 'pos is not start shift!!!'}).debug();
      redictCheck = true;
    }
    if (this.storage.isLogin() && redictCheck !== false) {
      return true;
    }
    const url = state.url;
    if (url.indexOf('/order') !== -1) {
      this.logger.set({n: 'order.guard', m: 'you are not login pos system, redirect to dashboard!'}).debug();
      redictCheck = true;
    }
    if (redictCheck) {
      this.router.navigate(['/dashboard']);
    }
    return false;
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    return this.canActivate(route, state);
  }

}
