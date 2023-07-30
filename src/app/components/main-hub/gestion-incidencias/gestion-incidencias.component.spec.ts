import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionIncidenciasComponent } from './gestion-incidencias.component';

describe('GestionIncidenciasComponent', () => {
  let component: GestionIncidenciasComponent;
  let fixture: ComponentFixture<GestionIncidenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestionIncidenciasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionIncidenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
