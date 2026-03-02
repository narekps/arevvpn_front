import { ViewContainerRef } from '@angular/core';

export class MdbPopconfirmConfig<D = any> {
  position?:
    | 'top'
    | 'top-right'
    | 'right-top'
    | 'right'
    | 'right-bottom'
    | 'bottom-right'
    | 'bottom'
    | 'bottom-left'
    | 'left-bottom'
    | 'left'
    | 'left-top'
    | 'top-left' = 'bottom';
  animation?: boolean = true;
  popconfirmMode?: 'inline' | 'modal' = 'inline';
  viewContainerRef?: ViewContainerRef;
  data?: D | null = null;
  offset?: number | null = 5;
}
