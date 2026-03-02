import { Component } from '@angular/core';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-oferta',
  imports: [],
  templateUrl: './oferta.component.html',
  styleUrl: './oferta.component.scss'
})
export class OfertaComponent {
  protected readonly environment = environment;
}
