import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FlowComponent } from './flow/flow.component';
import { CreateFlowComponent } from './dialogs/create-flow/create-flow.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';

import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRippleModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatGridListModule} from '@angular/material/grid-list';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { NodeOptionsComponent } from './dialogs/node-options/node-options.component';
import { NodeArrangeComponent } from './dialogs/node-arrange/node-arrange.component';
import { NodeDeleteComponent } from './dialogs/node-delete/node-delete.component';


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    CreateFlowComponent,
    FlowComponent,
    ConfirmDialogComponent,
    NodeOptionsComponent,
    NodeArrangeComponent,
    NodeDeleteComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatTabsModule,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    NgxGraphModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatRippleModule,
    MatTableModule,
    MatListModule,
    MatSelectModule,
    MatGridListModule
  ],
providers: [],
bootstrap: [AppComponent]
})
export class AppModule { }
