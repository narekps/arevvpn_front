import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {InstructionComponent} from "./page/instruction/instruction.component";
import {OfertaComponent} from "./page/oferta/oferta.component";
import {ReturnPolicyComponent} from "./page/return-policy/return-policy.component";
import {CancelSubscriptionComponent} from "./page/cancel-subscription/cancel-subscription.component";
import {CookiesPolicyComponent} from "./page/cookies-policy/cookies-policy.component";
import {PrivacyPolicyComponent} from "./page/privacy-policy/privacy-policy.component";
import {OrderComponent} from "./order/order.component";
import {CallbackComponent} from "./order/callback/callback.component";
import {environment} from "../environments/environment";

const routes: Routes = [
  {path: '', component: HomeComponent, title: environment.APP_NAME+' - Вечная связь. Без границ.'},
  {path: 'instruction', component: InstructionComponent, title: 'Инструкция по подключению - '+environment.APP_NAME},
  {path: 'order', component: OrderComponent, title: 'Оформление покупки - '+environment.APP_NAME},
  {path: 'order/callback', component: CallbackComponent, title: 'Активация подписки - '+environment.APP_NAME},
  {path: 'oferta', component: OfertaComponent, title: 'Договор оферты - '+environment.APP_NAME},
  {path: 'return-policy', component: ReturnPolicyComponent, title: 'Политика возврата - '+environment.APP_NAME},
  {path: 'cancel-subscription', component: CancelSubscriptionComponent, title: 'Отмена подписки - '+environment.APP_NAME},
  {path: 'cookies-policy', component: CookiesPolicyComponent, title: 'Политика в отношении cookie - '+environment.APP_NAME},
  {path: 'privacy-policy', component: PrivacyPolicyComponent, title: 'Политика конфиденциальности - '+environment.APP_NAME},
  {path: '**', redirectTo: '', title: 'Страница не найдена - '+environment.APP_NAME}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
