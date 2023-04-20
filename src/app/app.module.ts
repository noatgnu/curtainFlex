import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {NgbActiveModal, NgbDropdown, NgbDropdownModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { ChartSelectionComponent } from './chart-selection/chart-selection.component';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import { DataManagementComponent } from './data-management/data-management.component';
import { VolcanoPlotComponent } from './plots/volcano-plot/volcano-plot.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {VolcanoPlotFormComponent} from "./chart-selection/volcano-plot-form/volcano-plot-form.component";
import { HeatmapFormComponent } from './chart-selection/heatmap-form/heatmap-form.component';
import { ScatterPlotFormComponent } from './chart-selection/scatter-plot-form/scatter-plot-form.component';
import { BarChartFormComponent } from './chart-selection/bar-chart-form/bar-chart-form.component';
import { LineChartFormComponent } from './chart-selection/line-chart-form/line-chart-form.component';
import { BoxPlotFormComponent } from './chart-selection/box-plot-form/box-plot-form.component';
import { PlotContainerComponent } from './plots/plot-container/plot-container.component';
import { PlotCompositorComponent } from './plots/plot-compositor/plot-compositor.component';

PlotlyModule.plotlyjs = PlotlyJS;
@NgModule({
  declarations: [
    AppComponent,
    ChartSelectionComponent,
    DataManagementComponent,
    VolcanoPlotComponent,
    VolcanoPlotFormComponent,
    HeatmapFormComponent,
    ScatterPlotFormComponent,
    BarChartFormComponent,
    LineChartFormComponent,
    BoxPlotFormComponent,
    PlotContainerComponent,
    PlotCompositorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    PlotlyModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    NgbActiveModal
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
