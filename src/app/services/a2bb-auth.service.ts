import { Injectable } from '@angular/core';
import { Http, Headers, URLSearchParams, RequestOptionsArgs, Response } from '@angular/http';
import { JwtHelper } from 'angular2-jwt';
import { Const } from '../const';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class A2BBAuthService {
  private _idSrvEndpoint = Const.ID_SRV_ENDPOINT;
  private _accessToken: string = null;
  private _refreshToken: string = null;
  private _tokenEndpoint = this._idSrvEndpoint + '/connect/token';
  private _jwtTokenHelper = new JwtHelper();
  private _lastBodyParams: URLSearchParams = null;
  private _lastPass: string = null;

  constructor(private _http: Http) { }

  reset(): void {
    this._accessToken = null;
    this._refreshToken = null;
    this._lastBodyParams = null;
    this._lastPass = null;
  }

  get lastPass(): string {
    return this._lastPass;
  }

  private accessToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isAuthorized()) {
        reject(null);
      }

      if (!this.isValid()) {
        this.refreshTokens(this._lastBodyParams).then(() => {
          resolve(this._accessToken);
        }).catch((err) => {
          console.log(err);
          reject(null);
        });
      } else {
        resolve(this._accessToken);
      }
    });
  }

  private processTokenRequest(bodyParams: URLSearchParams, resolve: (b: boolean) => void, reject: (e: any) => void): void {
    this._http.post(this._tokenEndpoint, bodyParams).toPromise().then((response) => {
      const tokenResp = response.json() as any;
      if (tokenResp.error) {
        reject(tokenResp);
      }

      this._accessToken = tokenResp.access_token;
      this._refreshToken = tokenResp.refresh_token;
      resolve(true);
    }).catch((err) => {
      reject(err.json());
    });
  }

  private augmentOptions(options?: RequestOptionsArgs): RequestOptionsArgs {
    if (!options) {
      options = {};
    }

    if (!options.headers) {
      options.headers = new Headers();
    }

    options.headers.append('Content-Type', 'application/json');

    return options;
  }

  isAuthorized(): boolean {
    const areTokenPresent = this._accessToken !== null && this._refreshToken !== null;
    return areTokenPresent;
  }

  isValid(): boolean {
    return !this._jwtTokenHelper.isTokenExpired(this._accessToken);
  }

  getTokens(user: string, password: string, bodyParams: URLSearchParams): Promise<boolean> {
    this._lastBodyParams = bodyParams.clone();
    this._lastPass = password;

    return new Promise<boolean>((resolve, reject) => {
      if (this.isAuthorized()) {
        resolve(true);
      }

      const body = bodyParams.clone();
      body.set('grant_type', 'password');
      body.set('username', user);
      body.set('password', password);

      this.processTokenRequest(body, resolve, reject);
    });
  }

  refreshTokens(bodyParams: URLSearchParams): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (!this.isAuthorized()) {
        reject(false);
      }

      const body = bodyParams.clone();
      body.set('grant_type', 'refresh_token');
      body.set('refresh_token', this._refreshToken);

      this.processTokenRequest(body, resolve, reject);
    });
  }

  get(url: string, options?: RequestOptionsArgs): Promise<Response> {
    options = this.augmentOptions(options);

    return this.accessToken().then((token) => {
      options.headers.append('Authorization', 'Bearer ' + this._accessToken);
      return this._http.get(url, options).toPromise();
    });
  }

  post(url: string, body: any, options?: RequestOptionsArgs): Promise<Response> {
    options = this.augmentOptions(options);

    return this.accessToken().then((token) => {
      options.headers.append('Authorization', 'Bearer ' + this._accessToken);
      return this._http.post(url, body, options).toPromise();
    });
  }

  put(url: string, body: any, options?: RequestOptionsArgs): Promise<Response> {
    options = this.augmentOptions(options);

    return this.accessToken().then((token) => {
      options.headers.append('Authorization', 'Bearer ' + this._accessToken);
      return this._http.put(url, body, options).toPromise();
    });
  }

  delete(url: string, options?: RequestOptionsArgs): Promise<Response> {
    options = this.augmentOptions(options);

    return this.accessToken().then((token) => {
      options.headers.append('Authorization', 'Bearer ' + this._accessToken);
      return this._http.delete(url, options).toPromise();
    });
  }
}
