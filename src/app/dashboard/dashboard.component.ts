import { Component, OnInit } from '@angular/core';
import { A2BBAuthService } from '../services/a2bb-auth.service';
import { Device } from '../models/device';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs/Rx';
import { Http } from '@angular/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  devices: Device[];
  oldPass: string;
  newPass: string;
  changePassInfo = '';
  newDeviceName: string;
  selectedDevice: Device;
  tempGuid: string;
  tempGuidTimer: Observable<number>;
  timerSubscription: Subscription;

  constructor(private _router: Router, private _a2bbAuthService: A2BBAuthService,
      private _http: Http) { }

  ngOnInit() {
    this.refreshDevices();
  }

  changePass(): void {
    this._a2bbAuthService.put('http://localhost:5001/api/me/changepass', {
      oldPassword: this.oldPass,
      newPassword: this.newPass,
    }).then((res) => {
      const response = res.json();

      if (response.code === 0) {
        this._a2bbAuthService.reset();
        this._router.navigate(['/login']);
      }

      let msg = response.message;
      if (response.payload) {
        msg += ' - ' + JSON.stringify(response.payload);
      }
      this.changePassInfo = msg as string;
    }).catch((err) => {
      if (err.payload !== undefined) {
        this.changePassInfo = JSON.stringify(err.payload);
      } else {
        this.changePassInfo = 'Unable to change password, please check your old password is ok';
      }
    });
  }

  selectDevice(device: Device): void {
    this.selectedDevice = device;
  }

  refreshDevices(): void {
    this._a2bbAuthService.get('http://localhost:5001/api/me/devices').then((res) => {
      this.devices = res.json().payload as Device[];
    }).catch((err) => {
      console.log(err);
      this._router.navigate(['/login']);
    });
  }

  startCreateNewDevice(): void {
    const dev: Device = new Device();
    dev.name = this.newDeviceName;
    dev.enabled = true;

    this._a2bbAuthService.post('http://localhost:5001/api/me/devices', {
      device: dev,
      password: this._a2bbAuthService.lastPass
    }).then((res) => {
      this.tempGuid = res.json().payload as string;
      this.tempGuidTimer = Observable.timer(3000, 3000);
      this.timerSubscription = this.tempGuidTimer.subscribe(t => this.checkNewDeviceLink(t));
    }).catch((err) => {
      console.log(err);
    });
  }

  checkNewDeviceLink(t: any): void {
    this._http.get('http://localhost:5001/api/link/' + this.tempGuid).toPromise()
    .then((res) => {
      const isLinked = res.json().payload as boolean;
      if (isLinked) {
        this.timerSubscription.unsubscribe();
        this.tempGuidTimer = null;

        this.newDeviceName = null;
        this.tempGuid = null;

        this.refreshDevices();
      }
    }).catch((err) => {
      console.log(err);
    });
  }

  toggleEnableSelected(): void {
    if (!this.selectedDevice) {
      return;
    }

    this.selectedDevice.enabled = !this.selectedDevice.enabled;

    this._a2bbAuthService.put('http://localhost:5001/api/me/devices/' +
        this.selectedDevice.id, this.selectedDevice).then((res) => {
          this.selectedDevice = null;
      this.refreshDevices();
    }).catch((err) => {
      console.log(err);
    });
  }
}
