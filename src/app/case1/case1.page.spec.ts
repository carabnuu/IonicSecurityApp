import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { Case1Page } from './case1.page';

describe('Case1Page', () => {
  let component: Case1Page;
  let fixture: ComponentFixture<Case1Page>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Case1Page ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Case1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
