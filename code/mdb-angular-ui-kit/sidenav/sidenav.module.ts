import { MdbSidenavComponent } from './sidenav.component';
import { MdbSidenavLayoutComponent } from './sidenav-layout.component';
import { MdbSidenavContentComponent } from './sidenav-content.component';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
import { MdbScrollbarModule } from 'mdb-angular-ui-kit/scrollbar';
import { MdbSidenavItemComponent } from './sidenav-item.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MdbSidenavMenuDirective } from './sidenav-menu.directive';
@NgModule({
  imports: [CommonModule, MdbCollapseModule, MdbScrollbarModule],
  declarations: [
    MdbSidenavComponent,
    MdbSidenavLayoutComponent,
    MdbSidenavContentComponent,
    MdbSidenavItemComponent,
    MdbSidenavMenuDirective,
  ],
  exports: [
    MdbSidenavComponent,
    MdbSidenavLayoutComponent,
    MdbSidenavContentComponent,
    MdbSidenavItemComponent,
    MdbSidenavMenuDirective,
  ],
})
export class MdbSidenavModule {}
