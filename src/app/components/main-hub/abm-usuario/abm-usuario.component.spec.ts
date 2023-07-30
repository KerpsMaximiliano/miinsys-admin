import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbmUsuarioComponent } from './abm-usuario.component';

describe('AbmUsuarioComponent', () => {
  let component: AbmUsuarioComponent;
  let fixture: ComponentFixture<AbmUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbmUsuarioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbmUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
