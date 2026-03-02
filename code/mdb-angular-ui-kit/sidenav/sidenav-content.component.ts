import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'mdb-sidenav-content',
  templateUrl: 'sidenav-content.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MdbSidenavContentComponent {
  constructor() {}
}
