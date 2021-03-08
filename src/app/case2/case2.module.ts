import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Case2PageRoutingModule } from './case2-routing.module';

import { Case2Page } from './case2.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Case2PageRoutingModule
  ],
  declarations: [Case2Page]
})
export class Case2PageModule {}
