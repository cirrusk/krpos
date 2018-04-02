import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const currentUserInfo = JSON.parse(sessionStorage.getItem('tokenInfo'));

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
