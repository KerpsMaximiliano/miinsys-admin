import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbmTurnoJornadaComponent } from './abm-turno-jornada.component';

describe('AbmTurnoJornadaComponent', () => {
  let component: AbmTurnoJornadaComponent;
  let fixture: ComponentFixture<AbmTurnoJornadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbmTurnoJornadaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbmTurnoJornadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
