import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-node-delete',
  templateUrl: './node-delete.component.html',
  styleUrls: ['./node-delete.component.scss']
})
export class NodeDeleteComponent implements OnInit {

  links = [];
  nodes = [];
  childs = [];
  list = [];
  constructor(public dialogRef: MatDialogRef<NodeDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data) { 
      this.nodes = this.data.nodes;
      this.links = this.data.links;
      this.childs = this.data.childs;
    }

  ngOnInit(): void {
    let nodess = this.nodes;
    this.childs.forEach(element => {
      let ids = this.links[element]['target'];
      let dataIndex = this.nodes.findIndex((element) =>{
        return element.id === ids;
      });
      nodess.splice(dataIndex,1);
    });
    this.list = nodess;
    // console.log(nodess);
  }

  edit(node):void {
    this.dialogRef.close(node);
  }

}
