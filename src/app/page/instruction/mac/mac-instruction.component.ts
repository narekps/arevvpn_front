import {Component} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {ScreenshotComponent} from '../../../shared/components/screenshot/screenshot.component';
import {InstructionSuccessComponent} from '../instruction-success.component';

@Component({
  selector: 'app-mac-instruction',
  imports: [ScreenshotComponent, InstructionSuccessComponent],
  templateUrl: './mac-instruction.component.html',
})
export class MacInstructionComponent {
  protected readonly environment = environment;
}
