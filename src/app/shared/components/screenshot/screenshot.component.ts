import {Component, Input} from '@angular/core';
import {MdbModalService} from 'mdb-angular-ui-kit/modal';
import {ScreenshotModalComponent} from './screenshot-modal.component';

@Component({
  selector: 'app-screenshot',
  imports: [],
  providers: [MdbModalService],
  template: `
    @if (src) {
      <div class="screenshot-wrapper" [class.mb-3]="marginBottom">
        <img
          [src]="src"
          [alt]="alt"
          class="screenshot-img rounded cursor-pointer"
          (click)="openModal()"
          role="button"
          tabindex="0"
          (keydown.enter)="openModal()"
          [attr.aria-label]="'Открыть скриншот: ' + alt"
        >
        <div class="screenshot-zoom-hint">
          <i class="fas fa-search-plus me-1"></i>Увеличить
        </div>
      </div>
    } @else {
      <div class="img-placeholder rounded" [class.mb-3]="marginBottom">
        <i class="fas fa-image"></i>
        <p>{{ alt }}</p>
      </div>
    }
  `,
  styles: [`
    .screenshot-wrapper {
      position: relative;
      display: inline-block;
      width: 100%;
    }

    .screenshot-img {
      width: 100%;
      max-height: 180px;
      object-fit: contain;
      object-position: top center;
      display: block;
      transition: opacity 0.2s ease, transform 0.2s ease;
      outline: none;
      border: none;
      background: transparent;
    }

    .screenshot-wrapper:hover .screenshot-img {
      opacity: 0.9;
      transform: scale(1.01);
    }

    .screenshot-zoom-hint {
      position: absolute;
      bottom: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      font-size: 0.72rem;
      padding: 3px 8px;
      border-radius: 4px;
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
    }

    .screenshot-wrapper:hover .screenshot-zoom-hint {
      opacity: 1;
    }

    .img-placeholder {
      background: #f8f9fa;
      border: 2px dashed #ced4da;
      border-radius: 12px;
      min-height: 160px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #868e96;
      padding: 24px 16px;
      text-align: center;
    }

    .img-placeholder i {
      font-size: 2.5rem;
      margin-bottom: 10px;
      color: #adb5bd;
    }

    .img-placeholder p {
      font-size: 0.85rem;
      line-height: 1.45;
      margin-bottom: 0;
    }
  `]
})
export class ScreenshotComponent {
  @Input() src = '';
  @Input() alt = '';
  @Input() caption = '';
  @Input() marginBottom = false;

  constructor(private readonly modalService: MdbModalService) {}

  openModal(): void {
    if (!this.src) return;
    this.modalService.open(ScreenshotModalComponent, {
      modalClass: 'screenshot-modal-transparent modal-fullscreen',
      keyboard: true,
      data: {
        src: this.src,
        alt: this.alt,
        caption: this.caption || this.alt,
      }
    });
  }
}

