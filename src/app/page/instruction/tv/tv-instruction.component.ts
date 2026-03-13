import {Component} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {ScreenshotComponent} from '../../../shared/components/screenshot/screenshot.component';
import {InstructionSuccessComponent} from '../instruction-success.component';

@Component({
  selector: 'app-tv-instruction',
  imports: [ScreenshotComponent, InstructionSuccessComponent],
  templateUrl: './tv-instruction.component.html',
})
export class TvInstructionComponent {
  protected readonly environment = environment;
}
