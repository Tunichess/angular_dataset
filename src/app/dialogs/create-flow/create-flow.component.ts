import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { constants } from '../../app.constants';
import { EmitterService } from '../../services/emitter.service';
import * as moment from 'moment';

@Component({
  selector: 'app-create-flow',
  templateUrl: './create-flow.component.html',
  styleUrls: ['./create-flow.component.scss']
})
export class CreateFlowComponent implements OnInit {

  createFlowForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    public dialogRef: MatDialogRef<CreateFlowComponent>,
    private emitterService: EmitterService
  ) { }

  ngOnInit(): void {
    this.createFlowForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: ['', []],
    });
  }

  onSubmit() {
    const rules = localStorage.getItem('rules') ? JSON.parse(localStorage.getItem('rules')) : [];
    rules.push({... this.createFlowForm.value, updated: moment().format(constants.dateFormat)});
    localStorage.setItem('rules', JSON.stringify(rules));

    this.router.navigate(['flow']).then(() => {
      this.onDismiss();
      setTimeout( () => {
        this.emitterService.emit(constants.emitterKeys.createFlow, this.createFlowForm.value);
      }, 10);
    });
  }

  onDismiss() {
    this.dialogRef.close(false);
  }

}
