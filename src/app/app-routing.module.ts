import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreloadAllModules, Routes, RouterModule } from '@angular/router';

import { LoginGuard, OrderGuard, OrderDeactivateGuard } from './core';

import { DashboardComponent } from './dashboard/dashboard.component';
import { OrderComponent } from './order/order.component';
import { OrderCompleteComponent } from './order/order-complete/order-complete.component';
import { ClientComponent } from './order/client/client.component';
import { NoticeResolver } from './order/notice/notice.resolver';
import { TestComponent } from './test/test.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/dashboard', },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'order', component: OrderComponent, canActivate: [OrderGuard], canDeactivate: [OrderDeactivateGuard], resolve: {notice: NoticeResolver} },
  { path: 'order-complete', component: OrderCompleteComponent, canActivate: [OrderGuard]},
  { path: 'client', component: ClientComponent, resolve: {notice: NoticeResolver}  },
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
  providers: [LoginGuard, OrderGuard, OrderDeactivateGuard, NoticeResolver]
})
export class AppRoutingModule { }
