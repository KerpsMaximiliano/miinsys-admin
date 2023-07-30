import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbmEmpresaComponent } from './abm-empresa.component';

describe('AbmEmpresaComponent', () => {
  let component: AbmEmpresaComponent;
  let fixture: ComponentFixture<AbmEmpresaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbmEmpresaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbmEmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
