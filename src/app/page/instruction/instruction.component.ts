import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from "@angular/common";
import {RouterLink} from "@angular/router";
import {environment} from "../../../environments/environment";
import {IosInstructionComponent} from "./ios/ios-instruction.component";
import {AndroidInstructionComponent} from "./android/android-instruction.component";
import {WindowsInstructionComponent} from "./windows/windows-instruction.component";
import {MacInstructionComponent} from "./mac/mac-instruction.component";
import {LinuxInstructionComponent} from "./linux/linux-instruction.component";
import {TvInstructionComponent} from "./tv/tv-instruction.component";

export type DeviceType = 'ios' | 'android' | 'windows' | 'mac' | 'linux' | 'tv';

interface DeviceOption {
  id: DeviceType;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-instruction',
  imports: [
    RouterLink,
    IosInstructionComponent,
    AndroidInstructionComponent,
    WindowsInstructionComponent,
    MacInstructionComponent,
    LinuxInstructionComponent,
    TvInstructionComponent,
  ],
  templateUrl: './instruction.component.html',
  styleUrl: './instruction.component.scss'
})
export class InstructionComponent implements OnInit {
  protected readonly environment = environment;
  activeDevice: DeviceType = 'windows';

  readonly devices: DeviceOption[] = [
    {id: 'ios',     label: 'iPhone / iPad', icon: 'fab fa-apple'},
    {id: 'android', label: 'Android',        icon: 'fab fa-android'},
    {id: 'windows', label: 'Windows',        icon: 'fab fa-windows'},
    {id: 'mac',     label: 'macOS',          icon: 'fab fa-apple'},
    {id: 'linux',   label: 'Linux',          icon: 'fab fa-linux'},
    {id: 'tv',      label: 'Smart TV',       icon: 'fas fa-tv'},
  ];

  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) {}

  ngOnInit(): void {
    setTimeout(() => window.scrollTo({top: 0, behavior: 'smooth'}), 300);
    if (isPlatformBrowser(this.platformId)) {
      this.activeDevice = this.detectDevice();
    }
  }

  private detectDevice(): DeviceType {
    const ua = navigator.userAgent.toLowerCase();
    if (/smart.?tv|googletv|androidtv|tizen|webos/.test(ua)) return 'tv';
    if (/ipad|iphone|ipod/.test(ua)) return 'ios';
    if (/android/.test(ua)) return 'android';
    if (/macintosh|mac os x/.test(ua)) return 'mac';
    if (/linux/.test(ua)) return 'linux';
    return 'windows';
  }

  setDevice(device: DeviceType): void {
    this.activeDevice = device;
  }
}
