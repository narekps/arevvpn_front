import {Component} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {ScreenshotComponent} from '../../../shared/components/screenshot/screenshot.component';
import {InstructionSuccessComponent} from '../instruction-success.component';

@Component({
  selector: 'app-windows-instruction',
  imports: [ScreenshotComponent, InstructionSuccessComponent],
  templateUrl: './windows-instruction.component.html',
})
export class WindowsInstructionComponent {
  protected readonly environment = environment;
}
