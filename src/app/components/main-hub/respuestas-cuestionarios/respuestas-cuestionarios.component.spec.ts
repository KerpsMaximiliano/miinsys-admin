import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RespuestasCuestionariosComponent } from './respuestas-cuestionarios.component';

describe('RespuestasCuestionariosComponent', () => {
  let component: RespuestasCuestionariosComponent;
  let fixture: ComponentFixture<RespuestasCuestionariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RespuestasCuestionariosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RespuestasCuestionariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
