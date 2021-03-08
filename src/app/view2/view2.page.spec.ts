import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { View2Page } from './view2.page';

describe('View2Page', () => {
  let component: View2Page;
  let fixture: ComponentFixture<View2Page>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ View2Page ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(View2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
