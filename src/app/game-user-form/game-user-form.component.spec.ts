import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameUserFormComponent } from './game-user-form.component';

describe('GameUserFormComponent', () => {
  let component: GameUserFormComponent;
  let fixture: ComponentFixture<GameUserFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameUserFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameUserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
