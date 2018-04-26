import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FormatReader {

  constructor(private http: HttpClient) { }

  public readFormat(url: string): Observable<any> {
    return this.http.get(url, { responseType: 'text'});
  }

  public get(url: string): Observable<any> {
    return this.http.get(url, { responseType: 'text'});
  }

}
