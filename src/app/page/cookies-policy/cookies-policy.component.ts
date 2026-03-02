import { Component } from '@angular/core';
import {environment} from "../../../environments/environment";
import {RouterLink, RouterLinkActive} from "@angular/router";

@Component({
  selector: 'app-cookies-policy',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './cookies-policy.component.html',
  styleUrl: './cookies-policy.component.scss'
})
export class CookiesPolicyComponent {
  protected readonly environment = environment;

}
