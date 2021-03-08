import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Case1Page } from './case1.page';

const routes: Routes = [
  {
    path: '',
    component: Case1Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Case1PageRoutingModule {}
