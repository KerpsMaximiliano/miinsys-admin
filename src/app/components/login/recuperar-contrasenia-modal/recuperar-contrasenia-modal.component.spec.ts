import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecuperarContraseniaModalComponent } from './recuperar-contrasenia-modal.component';

describe('RecuperarContraseniaModalComponent', () => {
  let component: RecuperarContraseniaModalComponent;
  let fixture: ComponentFixture<RecuperarContraseniaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecuperarContraseniaModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecuperarContraseniaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
