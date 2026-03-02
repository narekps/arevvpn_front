import { Component } from '@angular/core';
import {environment} from "../../../environments/environment";
import {RouterLink, RouterLinkActive} from "@angular/router";

@Component({
  selector: 'app-return-policy',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './return-policy.component.html',
  styleUrl: './return-policy.component.scss'
})
export class ReturnPolicyComponent {
  protected readonly environment = environment;

}
