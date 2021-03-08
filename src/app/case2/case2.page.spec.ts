import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { Case2Page } from './case2.page';

describe('Case2Page', () => {
  let component: Case2Page;
  let fixture: ComponentFixture<Case2Page>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Case2Page ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Case2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
