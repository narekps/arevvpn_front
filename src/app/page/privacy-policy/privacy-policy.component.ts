import { Component } from '@angular/core';
import {environment} from "../../../environments/environment";
import {RouterLink, RouterLinkActive} from "@angular/router";

@Component({
  selector: 'app-privacy-policy',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  protected readonly environment = environment;

}
