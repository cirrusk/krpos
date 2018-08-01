import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { StorageService } from '../service/storage.service';
import { Logger } from '../logger/logger';

/**
 * 로그인 여부 체크하여 페이지 guard
 */
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
      this.logger.set('login.guard', 'you are not login pos system, redirect to dashboard!').debug();
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
