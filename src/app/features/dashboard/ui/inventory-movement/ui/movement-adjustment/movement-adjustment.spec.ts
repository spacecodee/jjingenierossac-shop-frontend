import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementAdjustment } from './movement-adjustment';

describe('MovementAdjustment', () => {
  let component: MovementAdjustment;
  let fixture: ComponentFixture<MovementAdjustment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovementAdjustment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovementAdjustment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
