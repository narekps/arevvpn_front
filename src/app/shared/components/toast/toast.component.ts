import { Component } from '@angular/core';
import { MdbNotificationRef } from 'mdb-angular-ui-kit/notification';
import {MdbRippleModule} from "mdb-angular-ui-kit/ripple";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  imports: [
    MdbRippleModule,
    NgIf
  ]
})
export class ToastComponent {
  type: string = 'primary';
  title: string = 'Success!';
  message: string = "You've successfully."
  showButton: boolean = false;
  buttonText: string = 'Close';
  constructor(public notificationRef: MdbNotificationRef<ToastComponent>) {}
}
