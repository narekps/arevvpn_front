import {Component} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {ScreenshotComponent} from '../../../shared/components/screenshot/screenshot.component';
import {InstructionSuccessComponent} from '../instruction-success.component';

@Component({
  selector: 'app-ios-instruction',
  imports: [ScreenshotComponent, InstructionSuccessComponent],
  templateUrl: './ios-instruction.component.html',
})
export class IosInstructionComponent {
  protected readonly environment = environment;
}
