import {AfterViewInit, ChangeDetectorRef, Component, Input, ViewChild} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormArray, FormBuilder} from "@angular/forms";
import {InputFile} from "../classes/input-file";
import {DataFrame, IDataFrame, Series} from "data-forge";
import {VolcanoPlotFormComponent} from "./volcano-plot-form/volcano-plot-form.component";
import {CorrelationMatrixFormComponent} from "./correlation-matrix/correlation-matrix-form.component";
import {ScatterPlotFormComponent} from "./scatter-plot-form/scatter-plot-form.component";
import {BarChartFormComponent} from "./bar-chart-form/bar-chart-form.component";
import {LineChartFormComponent} from "./line-chart-form/line-chart-form.component";
import {BoxPlotFormComponent} from "./box-plot-form/box-plot-form.component";

@Component({
  selector: 'app-cha rt-selection',
  templateUrl: './chart-selection.component.html',
  styleUrls: ['./chart-selection.component.less']
})
export class ChartSelectionComponent implements AfterViewInit{
  @ViewChild(VolcanoPlotFormComponent) volcano: VolcanoPlotFormComponent | undefined
  @ViewChild(CorrelationMatrixFormComponent) correlationMatrix: CorrelationMatrixFormComponent | undefined
  @ViewChild(ScatterPlotFormComponent) scatter: ScatterPlotFormComponent | undefined
  @ViewChild(BarChartFormComponent) bar: BarChartFormComponent | undefined
  @ViewChild(LineChartFormComponent) line: LineChartFormComponent | undefined
  @ViewChild(BoxPlotFormComponent) box: BoxPlotFormComponent | undefined

  _data: {files: Map<string, InputFile>, filenameList: string[]} = {files: new Map<string, InputFile>, filenameList: []}
  selectedFile: string = ""
  selectedPlotType: string = "volcano-plot"
  selectedDF: IDataFrame = new DataFrame()
  @Input() set data(value: {files: Map<string, InputFile>, filenameList: string[]}) {
    this._data = value
    this.initialForm.controls['filename'].setValue(this._data.filenameList[0] || '')
    this.selectedFile = this._data.filenameList[0] || ''
  }

  get data(): {files: Map<string, InputFile>, filenameList: string[]} {
    return this._data
  }


  plotTypeList = [
    {name: 'Volcano Plot', value: 'volcano-plot'},
    {name: 'Correlation Matrix', value: 'correlation-matrix'},
    {name: 'Scatter Plot', value: 'scatter-plot'},
    {name: 'Bar Chart', value: 'bar-chart'},
    {name: 'Line Chart', value: 'line-chart'},
    {name: 'Box Plot', value: 'box-plot'},
  ]

  initialForm = this.fb.group({
    plotType: ['volcano-plot'],
    filename: [''],
  })


  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder, private changeDetectorRef: ChangeDetectorRef) {
    this.initialForm.controls['filename'].valueChanges.subscribe(value => {
      if (value) {
        this.selectedFile = value
        this.selectedDF = this.data.files.get(value)?.df || new DataFrame()
      }
    })
    this.initialForm.controls['plotType'].valueChanges.subscribe(value => {
      if (value) {
        this.selectedPlotType = value
        changeDetectorRef.detectChanges()
      }
    })
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.changeDetectorRef.detectChanges()
    console.log(this.form)
  }

  get volcanoForm() {
    return this.volcano?.form
  }

  get correlationMatrixForm() {
    return this.correlationMatrix?.form
  }

  get scatterForm() {
    return this.scatter?.form
  }

  get barForm() {
    return this.bar?.form
  }

  get lineForm() {
    return this.line?.form
  }

  get boxForm() {
    return this.box?.form
  }

  get form() {
    switch (this.selectedPlotType) {
      case 'volcano-plot':
        return this.volcanoForm?.value
      case 'heatmap':
        return this.correlationMatrixForm?.value
      case 'scatter-plot':
        return this.scatterForm?.value
      case 'bar-chart':
        return this.barForm?.value
      case 'line-chart':
        return this.lineForm?.value
      case 'box-plot':
        return this.boxForm?.value
      default:
        return {}
    }
  }

  submit() {
    this.activeModal.close({data: this.selectedDF, form: this.form, plotType: this.selectedPlotType})
  }
}
