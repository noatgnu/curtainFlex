import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {NgbActiveModal, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { ChartSelectionComponent } from './chart-selection/chart-selection.component';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import { DataManagementComponent } from './data-management/data-management.component';
import { VolcanoPlotComponent } from './plots/volcano-plot/volcano-plot.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {VolcanoPlotFormComponent} from "./chart-selection/volcano-plot-form/volcano-plot-form.component";
import { CorrelationMatrixFormComponent } from './chart-selection/correlation-matrix/correlation-matrix-form.component';
import { ScatterPlotFormComponent } from './chart-selection/scatter-plot-form/scatter-plot-form.component';
import { BarChartFormComponent } from './chart-selection/bar-chart-form/bar-chart-form.component';
import { LineChartFormComponent } from './chart-selection/line-chart-form/line-chart-form.component';
import { BoxPlotFormComponent } from './chart-selection/box-plot-form/box-plot-form.component';
import { PlotContainerComponent } from './plots/plot-container/plot-container.component';
import { PlotCompositorComponent } from './plots/plot-compositor/plot-compositor.component';
import { ProteinSummaryChartComponent } from './plots/protein-summary-chart/protein-summary-chart.component';
import { ChartDeckComponent } from './plots/chart-deck/chart-deck.component';
import {ColorPickerModule} from "ngx-color-picker";
import { BatchSearchModalComponent } from './modal/batch-search-modal/batch-search-modal.component';
import { SelectExtraMetadataModalComponent } from './modal/select-extra-metadata-modal/select-extra-metadata-modal.component';
import { VolcanoSelectionModalComponent } from './plots/volcano-plot/volcano-selection-modal/volcano-selection-modal.component';

PlotlyModule.plotlyjs = PlotlyJS;
@NgModule({
  declarations: [
    AppComponent,
    ChartSelectionComponent,
    DataManagementComponent,
    VolcanoPlotComponent,
    VolcanoPlotFormComponent,
    CorrelationMatrixFormComponent,
    ScatterPlotFormComponent,
    BarChartFormComponent,
    LineChartFormComponent,
    BoxPlotFormComponent,
    PlotContainerComponent,
    PlotCompositorComponent,
    ProteinSummaryChartComponent,
    ChartDeckComponent,
    BatchSearchModalComponent,
    SelectExtraMetadataModalComponent,
    VolcanoSelectionModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    PlotlyModule,
    FormsModule,
    ReactiveFormsModule,
    ColorPickerModule
  ],
  providers: [
    NgbActiveModal
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
