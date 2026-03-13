import {Component, Input} from '@angular/core';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-instruction-success',
  imports: [],
  template: `
    <div class="alert alert-success d-flex align-items-center gap-3 mb-3">
      <i class="fas fa-check-circle fa-2x flex-shrink-0"></i>
      <div>
        <strong>Готово!</strong> {{ message }}
      </div>
    </div>
    <div class="text-center">
      <p class="text-muted small mb-2">Возникли вопросы?</p>
      <a href="https://t.me/{{ environment.TELEGRAM.SUPPORT_USERNAME }}"
         target="_blank" rel="noopener"
         class="btn btn-outline-warning btn-sm">
        <i class="fab fa-telegram me-2"></i>Написать в поддержку
      </a>
    </div>
  `,
})
export class InstructionSuccessComponent {
  protected readonly environment = environment;

  @Input() message = 'VPN активен. Теперь вы можете пользоваться интернетом без границ — трафик зашифрован.';
}

