import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { StorageService } from '../service/storage.service';
import { Logger } from '../logger/logger';
import { LockType } from '../../data/models/lock-type';

@Injectable()
export class OrderGuard implements CanActivate, CanActivateChild {

  constructor(private storage: StorageService, private router: Router, private logger: Logger) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    let redictCheck = false;
    const lockType = this.storage.getScreenLockType();
    const batchinfo = this.storage.getBatchInfo();
    const islogin = this.storage.isLogin();
    if (lockType === LockType.LOCK) {
      this.logger.set('order.guard', 'pos is locked!!!').debug();
      redictCheck = true;
    }
    if (batchinfo === null) {
      this.logger.set('order.guard', 'pos is not start shift!!!').debug();
      redictCheck = true;
    }
    if (islogin && redictCheck === false) {
      return true;
    }
    if (redictCheck) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    return this.canActivate(route, state);
  }

}
