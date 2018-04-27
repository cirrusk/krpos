import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
import { Http, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FormatReader {

  constructor(private http: Http) { }

  public readFormat(url: string): Observable<any> {
    // return this.http.get(url, { responseType: 'text'});
    return this.http.get(url, { responseType: ResponseContentType.Text });
  }

  public get(url: string): Observable<any> {
    // return this.http.get(url, { responseType: 'text'});
    return this.http.get(url, { responseType: ResponseContentType.Text });
  }

}
