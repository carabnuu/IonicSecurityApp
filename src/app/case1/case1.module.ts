import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Case1PageRoutingModule } from './case1-routing.module';

import { Case1Page } from './case1.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Case1PageRoutingModule
  ],
  declarations: [Case1Page]
})
export class Case1PageModule {}
