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
    // 주의! root 로 보내거나, dashboard로 바로 보내면 무한 루프에 빠질 수 있음.
    // 이유) 로그인 되지 않은 상태에서는 router가 계속 dashboard로 navigate 하기 때문에
    // dashbord -> not login -> login.guard -> dashboard 반복 될 수 있음.
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
