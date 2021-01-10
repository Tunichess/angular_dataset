import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-node-options',
  templateUrl: './node-options.component.html',
  styleUrls: ['./node-options.component.scss']
})
export class NodeOptionsComponent implements OnInit {

  actionData;
  constructor(public dialogRef: MatDialogRef<NodeOptionsComponent>) { }

  ngOnInit(): void {
  }

  action(action): void {
    this.dialogRef.close(action);
  }

}
