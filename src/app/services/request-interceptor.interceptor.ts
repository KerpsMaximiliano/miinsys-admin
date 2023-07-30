import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginService } from './login.service';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {

  private timeout = setTimeout(() => {
    this.loginService.logout()
  }, 30*60000);

  constructor(
    private loginService: LoginService
  ) {}
  
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.tokenCheck();
    if(localStorage.getItem('token') != null && localStorage.getItem('token') != undefined) {
      const token =  localStorage.getItem('token')!;
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      const Request = request.clone({ headers: headers });
      this.clearInactivity();
      return next.handle(Request);
    } else {
      this.clearInactivity();
      return next.handle(request);
    };
    
  }

  clearInactivity() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.loginService.logout()
    }, 30 * 60000);
  }

  tokenCheck() {
    let date = new Date();
    let expirationDate = new Date(localStorage.getItem('expiration')!);
    if(date > expirationDate) {
      this.loginService.logout();
    }
  }
}
