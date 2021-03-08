import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { View2PageRoutingModule } from './view2-routing.module';
import { View2Page } from './view2.page';
 @NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule, 
    View2PageRoutingModule,  
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA // Added for custom elements support
  ],
  declarations: [View2Page]
})
export class View2PageModule {}
