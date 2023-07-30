import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbmCuestionarioComponent } from './abm-cuestionario.component';

describe('AbmCuestionarioComponent', () => {
  let component: AbmCuestionarioComponent;
  let fixture: ComponentFixture<AbmCuestionarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbmCuestionarioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbmCuestionarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
