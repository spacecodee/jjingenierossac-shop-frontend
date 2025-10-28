import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementCreate } from './movement-create';

describe('MovementCreate', () => {
  let component: MovementCreate;
  let fixture: ComponentFixture<MovementCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovementCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovementCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
