export type AmPm = 'AM' | 'PM' | '';
export type ClearButton = string | false;
export type CloseButton = string | false;
export type Rounding = 1 | 5 | 10 | 15 | 20;
interface Position {
  left: number;
  top: number;
}

export interface Tick {
  time: string;
  left: number;
  bottom: number;
  disabled: boolean;
}

export interface Hour extends Position {
  hour: string;
}

export interface Minute extends Position {
  min: string;
}

export interface Radius {
  dial: number;
  outer: number;
  inner: number;
  tick: number;
}

export interface MdbTimepickerSelectedTime {
  h: string;
  m: string;
  ampm: 'AM' | 'PM' | '';
  date?: any;
}

export interface MdbTimepickerOptions {
  amLabel?: string;
  cancelLabel?: string;
  clearLabel?: string;
  okLabel?: string;
  pmLabel?: string;
}
