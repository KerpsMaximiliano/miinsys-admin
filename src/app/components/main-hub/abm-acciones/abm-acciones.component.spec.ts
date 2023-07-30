import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbmAccionesComponent } from './abm-acciones.component';

describe('AbmAccionesComponent', () => {
  let component: AbmAccionesComponent;
  let fixture: ComponentFixture<AbmAccionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbmAccionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbmAccionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
