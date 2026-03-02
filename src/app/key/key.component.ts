import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute} from "@angular/router";
import {MdbLoadingModule} from "mdb-angular-ui-kit/loading";
import {MdbRippleModule} from "mdb-angular-ui-kit/ripple";

@Component({
  selector: 'app-key',
  standalone: true,
  imports: [CommonModule, MdbLoadingModule, MdbRippleModule],
  templateUrl: './key.component.html',
  styleUrls: ['./key.component.scss']
})
export class KeyComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  }
}
