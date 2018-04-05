import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { StorageService } from '../../service/pos';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private storageService: StorageService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const currentUserInfo = this.storageService.getTokenInfo();

    if (currentUserInfo) {
      request = request.clone({
          setHeaders : {
              Authorization : `${currentUserInfo.token_type} ${currentUserInfo.access_token}`
          }
      });
    }

    return next.handle(request);
  }
}
