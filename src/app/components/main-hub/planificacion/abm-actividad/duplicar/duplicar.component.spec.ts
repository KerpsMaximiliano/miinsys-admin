import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicarComponent } from './duplicar.component';

describe('DuplicarComponent', () => {
  let component: DuplicarComponent;
  let fixture: ComponentFixture<DuplicarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DuplicarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
