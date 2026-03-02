import {Component} from '@angular/core';
import {MdbPopconfirmRef} from 'mdb-angular-ui-kit/popconfirm';

@Component({
  selector: 'app-popconfirm',
  templateUrl: './popconfirm.component.html',
})
export class PopconfirmComponent {
  message: string = 'Are you sure?';

  constructor(public popconfirmRef: MdbPopconfirmRef<PopconfirmComponent>) {}
}
