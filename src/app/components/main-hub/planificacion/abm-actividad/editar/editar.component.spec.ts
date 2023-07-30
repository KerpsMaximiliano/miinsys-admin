import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbmActividadEditarComponent } from './editar.component';

describe('AbmActividadEditarComponent', () => {
  let component: AbmActividadEditarComponent;
  let fixture: ComponentFixture<AbmActividadEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbmActividadEditarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbmActividadEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
