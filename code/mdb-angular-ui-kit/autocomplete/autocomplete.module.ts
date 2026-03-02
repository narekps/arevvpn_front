import { NgModule } from '@angular/core';

import { MdbAutocompleteComponent } from './autocomplete.component';
import { MdbAutocompleteDirective } from './autocomplete.directive';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MdbOptionModule } from 'mdb-angular-ui-kit/option';
import { OverlayModule } from '@angular/cdk/overlay';

@NgModule({
  declarations: [MdbAutocompleteComponent, MdbAutocompleteDirective],
  exports: [MdbAutocompleteComponent, MdbAutocompleteDirective, MdbOptionModule],
  imports: [CommonModule, FormsModule, MdbOptionModule, OverlayModule],
})
export class MdbAutocompleteModule {}
