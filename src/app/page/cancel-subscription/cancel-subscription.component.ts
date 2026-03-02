import { Component } from '@angular/core';
import {environment} from "../../../environments/environment";
import {RouterLink, RouterLinkActive} from "@angular/router";

@Component({
  selector: 'app-cancel-subscription',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './cancel-subscription.component.html',
  styleUrl: './cancel-subscription.component.scss'
})
export class CancelSubscriptionComponent {
  protected readonly environment = environment;

}
