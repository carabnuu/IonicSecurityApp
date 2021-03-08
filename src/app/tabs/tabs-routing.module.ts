import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        children: [
          {
            path: '',
            loadChildren: '../tab1/tab1.module#Tab1PageModule'
          },
            { 
              path: 'view1',
              children: [
              {
                path: '',
                loadChildren: '../view1/view1.module#View1PageModule'
              }
            ]
         },
         { 
          path: 'view2',
          children: [
          {
            path: '',
            loadChildren: '../view2/view2.module#View2PageModule'
          }
        ]
     }
            
          
        ]
      },
      {
        path: 'tab2',
        children: [
          {
            path: '',
            loadChildren: '../tab2/tab2.module#Tab2PageModule'
          },
            { 
              path: 'case1',
              children: [
              {
                path: '',
                loadChildren: '../case1/case1.module#Case1PageModule'
              }
            ]
         },
         { 
          path: 'case2',
          children: [
          {
            path: '',
            loadChildren: '../case2/case2.module#Case2PageModule'
          }
        ]
     }
            
          
        ]
      },
      {
        path: 'tab3',
        children: [
          {
            path: '',
            loadChildren: '../tab3/tab3.module#Tab3PageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
