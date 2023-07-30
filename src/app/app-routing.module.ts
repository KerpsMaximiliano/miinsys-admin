import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainHubComponent } from './components/main-hub/main-hub.component';

const routes: Routes = [
  {path: '', pathMatch : 'full', redirectTo: 'login'},
  {
    path: 'login',
    component  : LoginComponent
  },
  {
    path: 'dashboard',
    component: MainHubComponent
},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
