import {Component} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {ScreenshotComponent} from '../../../shared/components/screenshot/screenshot.component';
import {InstructionSuccessComponent} from '../instruction-success.component';

@Component({
  selector: 'app-android-instruction',
  imports: [ScreenshotComponent, InstructionSuccessComponent],
  templateUrl: './android-instruction.component.html',
})
export class AndroidInstructionComponent {
  protected readonly environment = environment;
}
