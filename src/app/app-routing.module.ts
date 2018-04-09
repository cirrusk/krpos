import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PreloadAllModules, Routes, RouterModule, Router } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { TestComponent } from './common/test/test.component';
import { OrderComponent } from './order/order.component';

import { LoginGuard } from './core/guard/login.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/dashboard', },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'order', component: OrderComponent, canActivate: [LoginGuard]},
  { path: 'test', component: TestComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, enableTracing: false })
  ],
  exports: [RouterModule],
  declarations: [],
  providers: [LoginGuard]
})
export class AppRoutingModule { }
