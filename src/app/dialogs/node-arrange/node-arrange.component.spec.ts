import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeArrangeComponent } from './node-arrange.component';

describe('NodeArrangeComponent', () => {
  let component: NodeArrangeComponent;
  let fixture: ComponentFixture<NodeArrangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeArrangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeArrangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
