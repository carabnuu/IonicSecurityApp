import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Case2Page } from './case2.page';

const routes: Routes = [
  {
    path: '',
    component: Case2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Case2PageRoutingModule {}
