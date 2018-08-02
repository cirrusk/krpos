import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { SpinnerService } from '../spinner/spinner.service';

/**
 * 스피너 show / hide 인터셉터 처리하여 자동으로 스피너가 뜨고 닫히게 구성
 *
 * 기존에는 HttpClient subscribe 하기 전에 show 하고
 * error 또는 finally 에서 hide 해주는 구조로 구성하여
 * 모든 HttpClient 서비스에서 show / hide 코드 삽입해주어야 했음.
 */
@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {

  constructor(private spinner: SpinnerService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.spinner.show();
    return next.handle(request).do(
      event => {
        if (event instanceof HttpResponse) {
          this.spinner.hide();
        }
      },
      err => {
        if (err instanceof HttpErrorResponse) {
          this.spinner.hide();
        }
      });
  }

}
