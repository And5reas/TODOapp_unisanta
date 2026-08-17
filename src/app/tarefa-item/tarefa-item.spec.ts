import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarefaItem } from './tarefa-item';

describe('TarefaItem', () => {
  let component: TarefaItem;
  let fixture: ComponentFixture<TarefaItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TarefaItem],
    }).compileComponents();

    fixture = TestBed.createComponent(TarefaItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
