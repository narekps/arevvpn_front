import {Component, OnInit} from '@angular/core';
import {RouterLink} from "@angular/router";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-instruction',
  imports: [
    RouterLink,
  ],
  templateUrl: './instruction.component.html',
  styleUrl: './instruction.component.scss'
})
export class InstructionComponent implements OnInit {
  protected environment = environment;

  ngOnInit(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  }
}
