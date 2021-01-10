import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-node-arrange',
  templateUrl: './node-arrange.component.html',
  styleUrls: ['./node-arrange.component.scss']
})
export class NodeArrangeComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<NodeArrangeComponent>,
    @Inject(MAT_DIALOG_DATA) public data) { }

  ngOnInit(): void {
  }

  edit(node):void {
    this.dialogRef.close(node);
  }

}
