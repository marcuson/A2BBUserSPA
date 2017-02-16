import { Component, OnInit } from '@angular/core';
import { A2BBAuthService } from '../services/a2bb-auth.service';
import { Router } from '@angular/router';
import { User } from '../models/user';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  users: User[];
  newUserName: string;
  newUserPass: string;
  selectedUser: User;

  constructor(private _router: Router, private _a2bbAuthService: A2BBAuthService) { }

  ngOnInit() {
    this.refreshUsers();
  }

  selectUser(user: User) {
    this.selectedUser = user;
  }

  refreshUsers(): void {
    this._a2bbAuthService.get('http://localhost:5000/api/admin/users').then((res) => {
      this.users = res.json() as User[];
    }).catch((err) => {
      console.log(err);
      this._router.navigate(['/login']);
    });
  }

  createNewUser(): void {
    this._a2bbAuthService.post('http://localhost:5000/api/admin/users', {
      User: {
        Username: this.newUserName
      },
      Password: this.newUserPass
    }).then((res) => {
      return this.refreshUsers();
    }).then(() => {
      this.newUserName = '';
      this.newUserPass = '';
    }).catch((err) => {
      console.log(err);
    });
  }

  deleteSelected(): void {
    if (!this.selectedUser) {
      return;
    }

    this._a2bbAuthService.delete('http://localhost:5000/api/admin/users/' +
        this.selectedUser.id).then((res) => {
      this.selectedUser = null;
      return this.refreshUsers();
    }).then(() => {
    }).catch((err) => {
      console.log(err);
    });
  }
}
