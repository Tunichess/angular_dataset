import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { constants } from '../app.constants';
import { EmitterService } from '../services/emitter.service';
import {MediaMatcher} from '@angular/cdk/layout';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

import { Layout, Edge, Node } from '@swimlane/ngx-graph';
import { DagreNodesOnlyLayout } from './customDagreNodesOnly';
import { stepRound } from './customStepCurved';
import * as moment from 'moment';

import { MatDialog } from '@angular/material/dialog';
import { NodeOptionsComponent } from '../dialogs/node-options/node-options.component';
import { NodeArrangeComponent } from '../dialogs/node-arrange/node-arrange.component';
import { NodeDeleteComponent } from '../dialogs/node-delete/node-delete.component';

@Component({
  selector: 'app-flow',
  templateUrl: './flow.component.html',
  styleUrls: ['./flow.component.scss'],
})
export class FlowComponent implements OnInit {
  mobileQuery: MediaQueryList;

  fillerNav = Array.from({length: 50}, (_, i) => `Nav Item ${i + 1}`);

  fillerContent = Array.from({length: 50}, () =>
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
       labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
       laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
       voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
       cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`);

  private _mobileQueryListener: () => void;




  shouldRun = [/(^|\.)plnkr\.co$/, /(^|\.)stackblitz\.io$/].some(h => h.test(window.location.host));


  destroy$: Subject<boolean> = new Subject<boolean>();
  constants = constants;
  flow;
  update$: Subject<any> = new Subject();
  selectedIndex = 0;
  icon = true;
  adding = '';
  flowNameEdit = false;
  showSuccessMsg = false;
  filteredTransformations;
  rules;
  activeRule;
  activateText;
  isActive: boolean;
  copyNodes = [];

  public curve: any = stepRound;
  public layout: Layout = new DagreNodesOnlyLayout();

  transformations = [
    {
      id: 1,
      title: 'Scale to min max',
      description: 'Scale a column to specific min max range',
    },
    {
      id: 2,
      title: 'One hot encode',
      description:
        'Create a column for each unique value indicationg its presence',
    },
    {
      id: 3,
      title: 'Scale to mean',
      description: 'Scale a column to zero mean and unit variance',
    },
  ];

  selectedDataset;
  ruleList: any;
  selectedName: any;

  constructor(private router: Router, private emitterService: EmitterService, private dialog: MatDialog,changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change',this._mobileQueryListener);}

    ngOnInit() {
    this.getRules();

    this.emitterService.emitter
      .pipe(takeUntil(this.destroy$))
      .subscribe((emitted) => {
        switch (emitted.event) {
          case constants.emitterKeys.createFlow:
            this.flow = emitted.data;
            this.selectedDataset = this.flow?.nodes?.[0];
            this.setActiveText();
            return;
        }
      });

    // temporary work around, until we have the API developed
    setTimeout(() => {
      if (!this.flow) {
        this.router.navigate(['']);
      }
    }, 500);
  }

  getRules(){
    this.rules = localStorage.getItem('rules') ? JSON.parse(localStorage.getItem('rules')) : [];
  }

  setActiveText(){
    if(!this.selectedDataset){
      return;
    }
    if(this.selectedDataset.active){
      this.activateText = "Deactivate";
      return;
    }

    this.activateText = "Activate";
    return;
  }
  selectName(name)
  {
    console.log(this.flow);

    if(!this.selectedName)
    {
      this.selectedName=name;
    }
    else if(this.selectedName!=name)
    {
      this.selectedName=name;
    }
    else if(this.selectedName==name)
    {
      this.selectedName="";
    }

  }
  addNewNode() {
    this.flow = {
      ...this.flow,
      nodes: [
        {
          id: '1',
          label: 'Rule 1',
          actions:[],
          checks: [],
          updated: moment().format(constants.dateFormat),
          parent: 'root',
          active: true
        },
      ],
      links: [],
    };
    this.selectedDataset = this.flow.nodes[0];
    setTimeout(() => {
      this.updateChart();
    }, 100);

    this.updateFlowInDb();
  }

  addDataset(dataset) {
    console.log(dataset);

    this.flow.nodes.push({
      id: `${parseInt(this.flow.nodes[this.flow.nodes.length-1].id) + 1}`,
      label: `Rule ${parseInt(this.flow.nodes[this.flow.nodes.length-1].id) + 1}`,
      actions:[],
      checks: [],
      updated: moment().format(constants.dateFormat),
      parent:  `${dataset.id}`,
      active: true
    });

    this.flow.links.push({
      id: `a${this.flow.nodes[this.flow.nodes.length-1].id}`, // id can't start from a digit
      source: `${dataset.id}`,
      target: `${this.flow.nodes[this.flow.nodes.length-1].id}`,
      label: `custom label ${this.flow.nodes[this.flow.nodes.length-1].id}`,
    });

    this.updateFlowInDb();
    this.updateChart();
  }

  add(transformation) {
    const transformationCopy = JSON.parse(JSON.stringify(transformation));
    if (this.adding === 'action') {
      this.selectedDataset.actions = [
        ...(this.selectedDataset.actions ? this.selectedDataset.actions : []),
        transformationCopy,
      ];
    } else {
      this.selectedDataset.checks = [
        ...(this.selectedDataset.checks ? this.selectedDataset.checks : []),
        transformationCopy,
      ];
    }
    this.updateFlowInDb();
    this.assignCopy();
  }

  updateFlowName(newFlowName) {
    const rules = JSON.parse(localStorage.getItem('rules'));
    let ruleToEdit = rules.find((rule) => rule.name === this.flow.name);
    ruleToEdit.name = newFlowName;
    ruleToEdit.updated = moment().format(constants.dateFormat);
    this.flow.name = newFlowName;
    localStorage.setItem('rules', JSON.stringify(rules));
    this.flowNameEdit = false;
  }

  removeFrom(from, action) {
    const toSearch = from === 'actions' ? this.selectedDataset.actions : this.selectedDataset.checks;
    const index = toSearch.findIndex(
      (_transformation) => action.id === _transformation.id
    );
    toSearch.splice(index, 1);
  }

  updateFlowInDb(showMsg = false) {
    const rules = JSON.parse(localStorage.getItem('rules'));
    let ind = rules.findIndex((rule) => rule.name === this.flow.name);
    rules[ind] = { ...this.flow };
    localStorage.setItem('rules', JSON.stringify(rules));

    if(showMsg) {
      this.showSuccessMsg = true;
      setTimeout(() => {
        this.showSuccessMsg = false;
      }, 1000);
    }
  }

  updateOtherFlow(flowName:string, flow:any, showMsg = false){
    const rules = JSON.parse(localStorage.getItem('rules'));
    let ind = rules.findIndex((rule) => rule.name === flowName);
    rules[ind] = { ...flow };
    localStorage.setItem('rules', JSON.stringify(rules));

    if(showMsg) {
      this.showSuccessMsg = true;
      setTimeout(() => {
        this.showSuccessMsg = false;
      }, 1000);
    }
  }


  updatelinks(flowName:string, flow:any, showMsg = false){
    const rules = JSON.parse(localStorage.getItem('rules'));
    let ind = rules.findIndex((rule) => rule.name === flowName);
    rules[ind] = { ...flow };
    localStorage.setItem('rules', JSON.stringify(rules));

    if(showMsg) {
      this.showSuccessMsg = true;
      setTimeout(() => {
        this.showSuccessMsg = false;
      }, 1000);
    }
  }

  updateSelectedDatasetUpdateDate() {
    this.selectedDataset.updated = moment().format(constants.dateFormat);
    return true;
  }

  getFormatedDate(date) {
    if (date) {
      return moment(date, constants.dateFormat).fromNow();
    }
    return '-';
  }

  getAvailableTransformationsForDataset() {
    const takenIds = this.adding === 'action' ? [
      ...this.selectedDataset?.actions.map(transformation => transformation.id)
    ] : [
      ...this.selectedDataset?.checks.map(transformation => transformation.id),
    ];

    return this.transformations.filter(
      transformation => !takenIds.includes(transformation.id)
    );
  }

  assignCopy() {
    this.filteredTransformations = Object.assign([], this.getAvailableTransformationsForDataset());
  }

  filterItem(value){
    if(!value){
      this.assignCopy();
    } // when nothing has typed
    this.filteredTransformations = Object.assign([], this.getAvailableTransformationsForDataset()).filter(
      item => item.title.toLowerCase().indexOf(value.toLowerCase()) > -1
    );
  }

  openSearch(action) {
    this.selectedIndex = 1;
    this.adding = action;
    this.assignCopy();
  }
  getRulesList()
  {
    this.ruleList=JSON.parse(localStorage.getItem('rules'));
  }

  navigateToHome() {
    this.router.navigate(['']);
  }

  updateChart() {
    this.update$.next(true);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change',this._mobileQueryListener);
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  onSetChange(event){
    this.activeRule = event.value;
  }

  onNodeChange(event){
     var links = this.flow.links;
     var curLink =  this.flow.links.filter(link=> link.target == this.selectedDataset.id)[0];
     var newLinks = links.filter((el) => {
      return el !== curLink;
    });
     curLink.source = event.value.toString();
     newLinks.push(curLink);

     this.flow.links = newLinks;
     this.updatelinks(this.flow.name, this.flow);
     this.updateChart();
  }

  sendRule(){
    var newRule= this.rules.filter(rule=> rule.name = this.activeRule)[0];
    var currRule = this.selectedDataset;
    currRule.label = newRule.name + '_' + currRule.label;
    currRule.id = (newRule.nodes.length + 1).toString();
    newRule.links.push({
      id: `a${currRule.id}`, // id can't start from a digit
      source: `0`,
      target: `${currRule.id}`,
      label: `custom label ${this.flow.nodes.length}`,
    })
    newRule.nodes.push(currRule);

    this.rules.filter(rule=> rule.name = this.activeRule)[0] == newRule;
    this.updateOtherFlow(newRule.name, newRule);
   }

   toggleActive(){
      this.selectedDataset.active = !this.selectedDataset.active;
      this.setActiveText();
   }


  deleteNode(){
    let id = this.selectedDataset.id
    let nodeIndex = this.flow.nodes.findIndex((element) =>{
      return element.id === id;
    });

    let edgeIndex = this.flow.links.findIndex((element) =>{
      return element.target === id;
    });

    let childsIndexs = [];
    this.flow.links.forEach((element, index) => {
      if(element.source == id){
        childsIndexs.push(index);
      }
    });

    if(childsIndexs.length == 0){
      this.flow.nodes.splice(nodeIndex,1);
      this.flow.links.splice(edgeIndex,1);
      this.updateFlowInDb();
      this.updateChart();
    } else {
      let nodes = [];
      let links = [];
      nodes = this.flow.nodes;
      links = this.flow.links;

      nodes.splice(nodeIndex,1);
      links.splice(edgeIndex,1);

      this.copyNodes = nodes;

      let childsIndexs2 = [];
      links.forEach((element, index) => {
        if(element.source == id){
          childsIndexs2.push(index);
        }
      });

      const dialogRef = this.dialog.open(NodeArrangeComponent, {
        data: nodes
      });
      dialogRef.afterClosed().subscribe(result => {
        if(result != undefined){
          // important
          childsIndexs2.forEach(elementIndex => {
            links[elementIndex]['source'] = result.id
          });

          this.flow.nodes = nodes;
          this.flow.links = links;

          this.updateFlowInDb();
          this.updateChart();

        }
      });
    }
  }

  onRightClick(node){
    this.selectedDataset = node;
    if (node.id != 0) {
      const dialogRef = this.dialog.open(NodeOptionsComponent);
      dialogRef.afterClosed().subscribe(result => {
        if (result == 'delete') {
          this.deleteNode();
        }
        if (result == 'edit') {
          this.openEditDialog();
        }
      });
    }
    return false;
  }

  openEditDialog(){
    const dialogRef = this.dialog.open(NodeArrangeComponent, {
      data: this.flow.nodes
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined){
        if (result.id != this.selectedDataset.id) {
          let edgeIndex = this.flow.links.findIndex((element) =>{
            return element.target === this.selectedDataset.id;
          });

          this.flow.links[edgeIndex]['source'] = result.id;

          this.updateFlowInDb();
          this.updateChart();
        }
      }
    });
  }
  openEditDialogExternal(appendNode,name){
    console.log(appendNode);

    const dialogRef = this.dialog.open(NodeArrangeComponent, {
      data: this.flow.nodes
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(result);

      if(result != undefined){
        this.addDatasetExternal(result,appendNode,name)
        // if (result.id != this.selectedDataset.id) {
        //   let edgeIndex = this.flow.links.findIndex((element) =>{
        //     return element.target === this.selectedDataset.id;
        //   });

        //   this.flow.links[edgeIndex]['source'] = result.id;

        //   this.updateFlowInDb();
        //   this.updateChart();
        // }
      }
    });
  }
  addDatasetExternal(dataset,appendNode,name) {
    console.log(dataset);

    this.flow.nodes.push({
      id: `${parseInt(this.flow.nodes[this.flow.nodes.length-1].id) + 1}`,
      label: name+'_'+appendNode.label,
      actions:appendNode.actions,
      checks: appendNode.checks,
      updated: moment().format(constants.dateFormat),
      parent:  `${dataset.id}`,
      hasChildren:false,
      active: true
    });

    this.flow.links.push({
      id: `a${this.flow.nodes[this.flow.nodes.length-1].id}`, // id can't start from a digit
      source: `${dataset.id}`,
      target: `${this.flow.nodes[this.flow.nodes.length-1].id}`,
      label: `custom label ${this.flow.nodes[this.flow.nodes.length-1].id}`,
    });

    this.updateFlowInDb();
    this.updateChart();
  }

  openEditDialogWhole(allNodes,name){
    console.log(allNodes);

    const dialogRef = this.dialog.open(NodeArrangeComponent, {
      data: this.flow.nodes
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(result);

      if(result != undefined){
        console.log(result);
        console.log(allNodes);
        console.log(name);
        this.addDatasetWhole(result,allNodes,name)


      }
    });
  }
mousePosition = {
  x: 0,
  y: 0
};

mouseDown($event) {
  this.mousePosition.x = $event.screenX;
  this.mousePosition.y = $event.screenY;
}



  gotoRule(name,$event) {
    if (this.mousePosition.x === $event.screenX && this.mousePosition.y === $event.screenY) {
      // Execute Clickconsole.log(name);

    var getRule=this.rules.filter(_=>_.name==name);
    console.log(this.rules);

    console.log(getRule);

    this.router.navigate(['flow']).then(() => {
      setTimeout( () => {
        this.emitterService.emit(constants.emitterKeys.createFlow, getRule[0]);

      }, 10);
    });
    }

  }

  addDatasetWhole(dataset,appendNode,name) {
    console.log(dataset);
    // var newValue=

    // var parentArray=[];
    // parentArray.push({
    //   newid:parseInt(this.flow.nodes[this.flow.nodes.length-1].id)+1,
    //   oldparent:appendNode[0].parent,
    //   oldid:appendNode[0].id,
    //   newParent:dataset.id
    // })

    this.flow.nodes.push({
      id: `${parseInt(this.flow.nodes[this.flow.nodes.length-1].id) + 1}`,
      label: name,
      actions:appendNode[0].actions,
      checks: appendNode[0].checks,
      updated: moment().format(constants.dateFormat),
      parent:  `${dataset.id}`,
      hasChildren:true,
      parentName:name,
      active: true
    });

    this.flow.links.push({
      id: `a${this.flow.nodes[this.flow.nodes.length-1].id}`, // id can't start from a digit
      source: `${dataset.id}`,
      target: `${this.flow.nodes[this.flow.nodes.length-1].id}`,
      label: `custom label ${this.flow.nodes[this.flow.nodes.length-1].id}`,
    });

    // appendNode.forEach(element => {
    //   if(element.parent==appendNode[0].parent)
    //   {
    //     element.parent=newValue;
    //   }

    // });
    // console.log(appendNode);


    // for(let i=1;i<appendNode.length;i++)
    // {
    //   var data=parentArray.filter(_=>_.oldparent==appendNode[i].parent)
    //   console.log(data);
    //   if(true)
    //   {
    //     parentArray.push({
    //       newid:parseInt(this.flow.nodes[this.flow.nodes.length-1].id)+1,
    //     oldparent:appendNode[i].parent,
    //     oldid:appendNode[i].id,
    //     newParent:parseInt(this.flow.nodes[this.flow.nodes.length-1].id)+1
    //   })
    //   }

    //   var newValue=parseInt(this.flow.nodes[this.flow.nodes.length-1].id)+1;
    //   this.flow.nodes.push({
    //     id: `${parseInt(this.flow.nodes[this.flow.nodes.length-1].id) + 1}`,
    //     label: name+'_'+appendNode[i].label,
    //     actions:appendNode[i].actions,
    //     checks: appendNode[i].checks,
    //     updated: moment().format(constants.dateFormat),
    //     parent:  -1,
    //     active: true
    //   });

    //   this.flow.links.push({
    //     id: `a${this.flow.nodes[this.flow.nodes.length-1].id}`, // id can't start from a digit
    //     source: -1,
    //     target: `${this.flow.nodes[this.flow.nodes.length-1].id}`,
    //     label: `custom label ${this.flow.nodes[this.flow.nodes.length-1].id}`,
    //   });

    //   // appendNode.forEach(element => {
    //   //   if(element.parent==appendNode[i].parent)
    //   //   {
    //   //     element.parent=newValue;
    //   //   }

    //   // });
    //   // console.log(appendNode);

    // }
    // this.flow.nodes.forEach(element => {
    //   if(element.parent==-1)
    //   {
    //     console.log("******dddddddddddd**");
    //     var foundParent=parentArray.filter(_=>_.newParent+""==element.id);
    //     if(foundParent.length>0)
    //     {
    //       console.log("******sssssssssss**");
    //       console.log(foundParent);

    //       var newIds=parentArray.filter(_=>_.oldid==foundParent[0].oldparent);
    //       if(newIds.length>0)
    //     {
    //       element.parent=newIds[0].newid+'';
    //       console.log("********");
    //       console.log(newIds);

    //       console.log(element.source);


    //     }
    //     }
    //   }

    // });
    // this.flow.links.forEach(element => {
    //   console.log(element.id[1]);

    //   if(element.source==-1)
    //   {
    //     console.log("******ddddddddddddllll**");
    //     var foundParent=parentArray.filter(_=>_.newParent+""==element.id[1]);
    //     if(foundParent.length>0)
    //     {
    //       console.log("******sssssssssssllllll**");
    //       console.log(foundParent);

    //       var newIds=parentArray.filter(_=>_.oldid==foundParent[0].oldparent);
    //       if(newIds.length>0)
    //     {
    //       element.source=newIds[0].newid+'';
    //       console.log("********llllllllll");
    //       console.log(newIds);

    //       console.log(element.parent);


    //     }
    //     }
    //   }

    // });
    // console.log(parentArray);
    // console.log(this.flow);

    this.updateFlowInDb();
    this.updateChart();
  }



}
