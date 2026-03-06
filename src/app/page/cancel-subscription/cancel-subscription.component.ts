import { Component } from '@angular/core';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-cancel-subscription',
  imports: [

  ],
  templateUrl: './cancel-subscription.component.html',
  styleUrl: './cancel-subscription.component.scss'
})
export class CancelSubscriptionComponent {
  protected readonly environment = environment;

}
