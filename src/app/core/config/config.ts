import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

// Observable operators
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';


@Injectable()
export class Config {
  private config: Object = null;
  private env:    string;
  constructor(private http: HttpClient) { }

  /**
     * Use to get the data found in the second file (config file)
     */
  public getConfig(key: any) {
      return this.config[key];
  }

  public load() {
    return new Promise((resolve, reject) => {
      this.env = 'dev';
      this.http.get('config/env.json')
      // .map(res => res.json())
      .map(res => res)
      .catch((error: any) => {
        console.error('Error reading "env.json" file');
        resolve(error);
        return Observable.throw(error.json().error || 'Server error');
      })
      .subscribe((envdata) => {
        this.env = envdata.env;
        console.log(`[akl pos] production type ===> ${this.env}`);
        let request: any = null;
        switch (this.env) {
          case 'prod': {
            request = this.http.get('config/config.' + this.env + '.json');
          } break;
          case 'dev': {
            request = this.http.get('config/config.' + this.env + '.json');
          } break;
          case 'default': {
            console.error('Environment file is not set or invalid.');
            resolve(true);
          } break;
        }
        if (request) {
          request
          // .map( res => res.json() )
          .map( res => res )
          .catch((error: any) => {
            console.error('Error reading ' + this.env + ' configuration file');
            resolve(error);
            return Observable.throw(error || 'Server error');
          })
          .subscribe((responseData) => {
            this.config = responseData;
            resolve(true);
          });
        } else {
          console.error('Env config file "env.json" is not valid');
          resolve(true);
        }
      });

    });
  }

}
