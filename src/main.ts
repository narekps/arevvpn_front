/// <reference types="@angular/localize" />

import {VERSION as CDK_VERSION} from '@angular/cdk';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

console.info('Angular CDK version', CDK_VERSION.full);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
