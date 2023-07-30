import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbmGrillaDatosComponent } from './abm-grilla-datos.component';

describe('AbmGrillaDatosComponent', () => {
  let component: AbmGrillaDatosComponent;
  let fixture: ComponentFixture<AbmGrillaDatosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbmGrillaDatosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbmGrillaDatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
