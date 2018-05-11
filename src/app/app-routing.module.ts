import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreloadAllModules, Routes, RouterModule, Router } from '@angular/router';

import { LoginGuard, OrderGuard } from './core';

import { DashboardComponent } from './dashboard/dashboard.component';
import { OrderComponent } from './order/order.component';
import { OrderCompleteComponent } from './order/order-complete/order-complete.component';
import { ClientComponent } from './order/client/client.component';
import { TestComponent } from './common/test/test.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/dashboard', },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'order', component: OrderComponent, canActivate: [OrderGuard]},
  { path: 'order-complete', component: OrderCompleteComponent, canActivate: [OrderGuard]},
  { path: 'client', component: ClientComponent },
  { path: 'test', component: TestComponent },
  { path: '**', redirectTo: '/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, enableTracing: false })
  ],
  exports: [RouterModule],
  declarations: [],
  providers: [LoginGuard, OrderGuard]
})
export class AppRoutingModule { }
