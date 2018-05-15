import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { SearchService } from '../../service';

@Injectable()
export class NoticeResolver implements Resolve<any> {

  constructor(private search: SearchService) {}

  /**
   * 공지사항 데이터 조회용 resolver
   *
   * @param route Router
   * @param state State
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const name = route.component && (<any>route.component).name;
    let param = '';
    if (name === 'ClientComponent') {
      param = 'cl';
    } else {
      param = 'ca';
    }
    return this.search.getNoticeList(param);
  }

}
