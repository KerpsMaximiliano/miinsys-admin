import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsabilidadComponent } from './usabilidad.component';

describe('UsabilidadComponent', () => {
  let component: UsabilidadComponent;
  let fixture: ComponentFixture<UsabilidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsabilidadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsabilidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
