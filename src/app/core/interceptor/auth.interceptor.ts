import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { StorageService } from '..';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private storage: StorageService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const currentUserInfo = this.storage.getTokenInfo();
    if (currentUserInfo) {
      const authreq = request.clone({
          // setHeaders : {
          //     Authorization : `${currentUserInfo.token_type} ${currentUserInfo.access_token}`
          // }
          headers: request.headers.set('Authorization', `${currentUserInfo.token_type} ${currentUserInfo.access_token}`)
      });
      return next.handle(authreq);
    } else {
      return next.handle(request);
    }
  }
}
