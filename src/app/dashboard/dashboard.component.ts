import { Component, OnInit } from '@angular/core';
import { DialogService } from '../services/dialog.service';
import { Router } from '@angular/router';
import { EmitterService } from '../services/emitter.service';
import { constants } from '../app.constants';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  ruleNameEdit=false;
  rules;
  dataSource;
  displayedColumns: string[] = ['name', 'description', 'modified', 'actions'];
  currentRule: any;
  changeName:string;
  changeDescription:string;
  constructor(
    private dialogService: DialogService,
    private router: Router,
    private emitterService: EmitterService
  ) { }

  ngOnInit(): void {
    this.rules = localStorage.getItem('rules') ? JSON.parse(localStorage.getItem('rules')) : [];

    this.dataSource = new MatTableDataSource(this.rules);
  }

  createFlow() {
    this.dialogService.createFlow();
  }

  getFormatedDate(rule) {
    if (rule.updated) {
      return moment(rule.updated, constants.dateFormat).fromNow();
    }
    return '-';
  }
  updateRuleName(name,description)
  {

      const rules = JSON.parse(localStorage.getItem('rules'));
      let ruleToEdit = rules.find((rule) => rule.name === this.currentRule.name);
      console.log(ruleToEdit);

      ruleToEdit.name = name;
      ruleToEdit.description = description;
      ruleToEdit.updated = moment().format(constants.dateFormat);
      // this.flow.name = newFlowName;
      localStorage.setItem('rules', JSON.stringify(rules));
      ruleToEdit.ruleNameEdit = false;
      this.ngOnInit();


  }
  gotoRule(rule) {
    this.router.navigate(['flow']).then(() => {
      setTimeout( () => {
        this.emitterService.emit(constants.emitterKeys.createFlow, rule);
      }, 10);
    });
  }

  deleteRule(rule) {
    this.dialogService.confirm('Are you sure?', 'This will delete the selected rule.').subscribe(
      res => {
        if (res) {
          this.rules = this.rules.filter(_rule => rule.name !== _rule.name);
          localStorage.setItem('rules', JSON.stringify(this.rules));
          this.dataSource.data = this.rules;
        }
      }
    );
  }
  setRule(rule)
  {
    console.log(rule);

    rule.ruleNameEdit=true;
    this.changeName=rule.name;
    this.changeDescription=rule.description;
    this.currentRule=rule;
  }

}
