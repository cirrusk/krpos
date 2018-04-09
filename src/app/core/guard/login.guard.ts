import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { StorageService, Logger } from '../../service/pos';

@Injectable()
export class LoginGuard implements CanActivate, CanActivateChild {
  constructor(private storage: StorageService, private router: Router, private logger: Logger) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.storage.isLogin()) {
      return true;
    }
    const url = state.url;
    if (url.indexOf('/order') !== -1) {
      this.logger.debug('you are not login pos system, redirect to dashbord!', 'login.guard');
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
