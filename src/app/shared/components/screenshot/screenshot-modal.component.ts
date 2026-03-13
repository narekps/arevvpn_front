import {Component, Input} from '@angular/core';
import {MdbModalRef} from 'mdb-angular-ui-kit/modal';

@Component({
  selector: 'app-screenshot-modal',
  imports: [],
  template: `
    <div class="screenshot-modal-overlay" (click)="close()">
      <button class="screenshot-modal-close btn btn-dark btn-sm"
              (click)="close()" aria-label="Закрыть">
        <i class="fas fa-times"></i>
      </button>
      <div class="screenshot-modal-body" (click)="$event.stopPropagation()">
        <img [src]="src" [alt]="alt" class="screenshot-modal-img">
        @if (caption) {
          <p class="screenshot-modal-caption">{{ caption }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .screenshot-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.88);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1060;
      padding: 16px;
      cursor: zoom-out;
    }

    .screenshot-modal-close {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 1070;
      opacity: 0.85;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .screenshot-modal-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: default;
      max-width: 95vw;
      max-height: 95vh;
    }

    .screenshot-modal-img {
      max-width: 100%;
      max-height: 88vh;
      border-radius: 8px;
      object-fit: contain;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
    }

    .screenshot-modal-caption {
      color: rgba(255, 255, 255, 0.85);
      font-size: 0.9rem;
      text-align: center;
      margin-top: 12px;
      margin-bottom: 0;
      max-width: 600px;
    }
  `]
})
export class ScreenshotModalComponent {
  @Input() src = '';
  @Input() alt = '';
  @Input() caption = '';

  constructor(public modalRef: MdbModalRef<ScreenshotModalComponent>) {}

  close(): void {
    this.modalRef.close();
  }
}

