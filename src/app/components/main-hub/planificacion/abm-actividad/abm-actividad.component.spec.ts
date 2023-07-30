import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbmActividadComponent } from './abm-actividad.component';

describe('AbmActividadComponent', () => {
  let component: AbmActividadComponent;
  let fixture: ComponentFixture<AbmActividadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbmActividadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbmActividadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
