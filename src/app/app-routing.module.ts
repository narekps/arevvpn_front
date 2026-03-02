import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {InstructionComponent} from "./page/instruction/instruction.component";
import {KeyComponent} from "./key/key.component";
import {OfertaComponent} from "./page/oferta/oferta.component";
import {ReturnPolicyComponent} from "./page/return-policy/return-policy.component";
import {CancelSubscriptionComponent} from "./page/cancel-subscription/cancel-subscription.component";
import {CookiesPolicyComponent} from "./page/cookies-policy/cookies-policy.component";
import {PrivacyPolicyComponent} from "./page/privacy-policy/privacy-policy.component";

const routes: Routes = [
  {path: '', component: HomeComponent, title: 'ArevVPN - Вечная связь. Без границ.'},
  {path: 'instruction', component: InstructionComponent, title: 'Инструкция по подключению - ArevVPN'},
  {path: 'oferta', component: OfertaComponent, title: 'Договор оферты - ArevVPN'},
  {path: 'return-policy', component: ReturnPolicyComponent, title: 'Политика возврата - ArevVPN'},
  {path: 'cancel-subscription', component: CancelSubscriptionComponent, title: 'Отмена подписки - ArevVPN'},
  {path: 'cookies-policy', component: CookiesPolicyComponent, title: 'Политика в отношении cookie - ArevVPN'},
  {path: 'privacy-policy', component: PrivacyPolicyComponent, title: 'Политика конфиденциальности - ArevVPN'},
  {path: 'key/:id', component: KeyComponent },
  {path: '**', redirectTo: '', title: 'Страница не найдена - ArevVPN'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
