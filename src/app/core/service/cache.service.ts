import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/of';
import { Logger } from '../logger/logger';

interface CacheContent {
  expiry: number;
  value: any;
}

/**
 * Observable 기반의 메모리 내장 캐시 구현
 * 진행중인 Observable 항목을 추적하고 캐시 된 값의 기본 만료를 설정.
 * @export
 * @class CacheService
 */
@Injectable()
export class CacheService {
  private cache: Map<string, CacheContent> = new Map<string, CacheContent>();
  private inFlightObservables: Map<string, Subject<any>> = new Map<string, Subject<any>>();
  readonly DEFAULT_MAX_AGE: number = 300000; // 5hr
  constructor(private logger: Logger) { }

  /**
   * 캐시를 이용하여 캐시에서 값을 가져옴.
   *
   * @param key 캐시키
   * @param fallback 캐시값이 없을 경우 함수 호출
   * @param maxage 캐시 유효기간
   */
  get(key: string, fallback?: Observable<any>, maxage?: number): Observable<any> | Subject<any> {
    if (this.hasValidCachedValue(key)) {
      this.logger.set('cache.service', `Getting values from cache[${key}]`).debug();
      return Observable.of(this.cache.get(key).value);
    }

    if (!maxage) {
      maxage = this.DEFAULT_MAX_AGE;
    }

    if (this.inFlightObservables.has(key)) {
      return this.inFlightObservables.get(key);
    } else if (fallback && fallback instanceof Observable) {
      this.inFlightObservables.set(key, new Subject());
      this.logger.set('cache.service', `Calling api and set values to cache[${key}]`).debug();
      return fallback.do((value) => { this.set(key, value, maxage); });
    } else {
      return Observable.throw('Requested key is not available in Cache');
    }
  }

  /**
   * 캐시키를 이용하여 캐시를 설정
   *
   * @param key 캐시키
   * @param value 캐시에 설정할 값
   * @param maxAge 유효기간
   */
  set(key: string, value: any, maxAge: number = this.DEFAULT_MAX_AGE): void {
    this.cache.set(key, { value: value, expiry: Date.now() + maxAge });
    this.notifyInFlightObservers(key, value);
  }

  /**
   * 캐시가 존재하는지 체크
   *
   * @param key 캐시키
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Observer가 있으면 모든 Observer에게 이벤트 전송
   *
   * @param key 캐시키
   * @param value 전송 값
   */
  private notifyInFlightObservers(key: string, value: any): void {
    if (this.inFlightObservables.has(key)) {
      const inFlight = this.inFlightObservables.get(key);
      const observersCount = inFlight.observers.length;
      if (observersCount) {
        this.logger.set('cache.service', `Notifying ${inFlight.observers.length} flight subscribers for ${key}`).debug();
        inFlight.next(value);
      }
      inFlight.complete();
      this.inFlightObservables.delete(key);
    }
  }

  /**
   * 캐시가 존재할 경우 만료기간이 지났으면 만료 처리
   *
   * @param key 캐시 키
   */
  private hasValidCachedValue(key: string): boolean {
    if (this.has(key)) {
      if (this.cache.get(key).expiry < Date.now()) {
        this.cache.delete(key);
        return false;
      }
      return true;
    } else {
      return false;
    }
  }

}
