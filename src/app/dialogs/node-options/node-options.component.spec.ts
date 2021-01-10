import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeOptionsComponent } from './node-options.component';

describe('NodeOptionsComponent', () => {
  let component: NodeOptionsComponent;
  let fixture: ComponentFixture<NodeOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
