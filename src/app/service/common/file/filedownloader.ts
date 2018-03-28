import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable, Subject } from "rxjs";

@Injectable()
export class FileDownloader {

    constructor(private http: HttpClient) {

    }

    public readContents(url: string): Observable<any> {
        return this.http.get(url, { responseType: 'text'});
    }

    public get(url: string): Observable<any> {
        return this.http.get(url, { responseType: 'text'});
    }
}