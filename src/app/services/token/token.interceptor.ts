import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { tap, retry } from 'rxjs/operators';
import { ErrorsHandlerHelper } from '../../helpers/handler-error/handle-error.helper';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptor implements HttpInterceptor {
  protected errorHandler;

  constructor(public auth: AuthService, private handler: ErrorsHandlerHelper) {
    this.errorHandler = handler;
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.auth.getToken() !== '') {
      request = request.clone({
       setHeaders: {
        Authorization: `Bearer ${this.auth.getToken()}`
       }
      });
    }
    return next.handle(request).pipe(retry(1), tap(
      (event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {

          if (event.body.error) {
            this.errorHandler.handleError(event);
            throw(event);
          }
        }
      },
    (error: any) => {
      if (error instanceof HttpErrorResponse) {
        this.errorHandler.handleError(error);
      }
    }
    ));

  }
}
