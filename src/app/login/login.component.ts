import { Component, OnInit } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Router } from '@angular/router';
import { A2BBAuthService } from '../services/a2bb-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  info: string = null;
  user: string = null;
  password: string = null;

  constructor(private _router: Router, private _authService: A2BBAuthService) { }

  ngOnInit() {
    this._authService.reset();
  }

  signIn() {
    this.info = 'Authenticating...';

    const bodyParams = new URLSearchParams();
    bodyParams.set('client_id', 'a2bb.ro_api');
    bodyParams.set('scope', 'A2BB_API offline_access');

    this._authService.getTokens(this.user, this.password, bodyParams).then((b) => {
      if (b === true) {
        this._router.navigate(['/dashboard']);
      }
    }).catch((err) => {
      if (err.error_description === 'invalid_username_or_password') {
        this.info = 'Invalid user/pass!';
      } else {
        this.info = 'Unknown error: ' + JSON.stringify(err);
      }
    });
  }

}
