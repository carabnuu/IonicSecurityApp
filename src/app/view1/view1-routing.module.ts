import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { View1Page } from './view1.page';

const routes: Routes = [
  {
    path: '',
    component: View1Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class View1PageRoutingModule {}
