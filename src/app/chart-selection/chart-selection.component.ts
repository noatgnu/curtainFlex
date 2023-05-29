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
import {PlotData} from "../interface/plot-data";
import {PtmSummaryChartFormComponent} from "./ptm-summary-chart-form/ptm-summary-chart-form.component";

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
  @ViewChild(PtmSummaryChartFormComponent) ptmBar: PtmSummaryChartFormComponent | undefined

  _data: {files: Map<string, InputFile>, filenameList: string[]} = {files: new Map<string, InputFile>, filenameList: []}
  selectedFile: string = ""
  selectedPlotType: string = ""
  selectedDF: IDataFrame = new DataFrame()

  @Input() set data(value: {files: Map<string, InputFile>, filenameList: string[]}) {
    this._data = value
    this.initialForm.controls['filename'].setValue(this._data.filenameList[0] || '')
    this.selectedFile = this._data.filenameList[0] || ''
  }

  get data(): {files: Map<string, InputFile>, filenameList: string[]} {
    return this._data
  }

  _plotList: PlotData[] = []

  @Input() set plotList(value: PlotData[]) {
    this._plotList = value
  }

  get plotList(): PlotData[] {
    return this._plotList
  }

  plotTypeList = [
    {name: 'Volcano Plot', value: 'volcano-plot', enable: true, availableInPTM: true, all: true},
    {name: 'Correlation Matrix', value: 'correlation-matrix', enable: false, availableInPTM: true, all: true},
    {name: 'Scatter Plot', value: 'scatter-plot', enable: false, availableInPTM: true, all: true},
    {name: 'Protein Intensity Data (Bar chart and violin plot)', value: 'bar-chart', enable: true, availableInPTM: false, all: false},
    {name: 'PTM Intensity Data (Bar chart and violin plot)', value: 'ptm-bar-chart', enable: true, availableInPTM: true, all: false},
    {name: 'Line Chart', value: 'line-chart', enable: false, availableInPTM: false, all: true},
    {name: 'Box Plot', value: 'box-plot', enable: false, availableInPTM: false, all: true},
  ]

  initialForm = this.fb.group({
    plotTitle: [crypto.randomUUID(),],
    plotType: ['volcano-plot',],
    filename: ['',],
    searchLinkTo: ['',],
    ptm: [false,],
    comparison: [''],
    comparisonCol: [''],
  })

  comparisons: string[] = []

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder, private changeDetectorRef: ChangeDetectorRef) {


    this.initialForm.controls['filename'].valueChanges.subscribe(value => {
      if (value) {
        this.selectedFile = value
        this.selectedDF = this.data.files.get(value)?.df || new DataFrame()
        console.log(this.selectedDF)
      }
    })
    this.initialForm.controls['ptm'].valueChanges.subscribe(value => {
      if (value) {
        console.log(this.selectedPlotType)
        this.initialForm.controls['plotType'].setValue('volcano-plot')
      }
    })
    this.initialForm.controls['plotType'].valueChanges.subscribe((value:any) => {
      if (value) {
        this.selectedPlotType = value
        console.log(this.selectedPlotType)
        changeDetectorRef.detectChanges()
      }
    })
    this.initialForm.controls["comparisonCol"].valueChanges.subscribe((value) => {
      if (value !== null && value !== "") {
        this.comparisons = this.selectedDF.getSeries(value).distinct().bake().toArray()
        this.initialForm.controls["comparison"].setValue(this.comparisons[0] || "")
        changeDetectorRef.detectChanges()
      }
    })
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.changeDetectorRef.detectChanges()
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

  get ptmBarForm() {
    return this.ptmBar?.form
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
      case 'ptm-bar-chart':
        return this.ptmBarForm?.value
      case 'line-chart':
        return this.lineForm?.value
      case 'box-plot':
        return this.boxForm?.value
      default:
        return {}
    }
  }

  submit() {
    console.log(this.form)
    if (this.data.files.get(this.selectedFile)) {
      this.activeModal.close({
        data: this.data.files.get(this.selectedFile),
        form: this.form,
        filename: this.selectedFile,
        plotType: this.selectedPlotType,
        plotTitle: this.initialForm.value['plotTitle'],
        searchLinkTo: this.initialForm.value['searchLinkTo'],
        ptm: this.initialForm.value['ptm'],
        comparison: this.initialForm.value['comparison'],
        comparisonCol: this.initialForm.value['comparisonCol'],
      })
    }
  }
}
