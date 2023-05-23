import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PlotDataGeneric} from "../../interface/plot-data";
import {DataService} from "../../services/data.service";
import {trigger, state, style, animate, transition} from '@angular/animations';
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-ptm-summary-chart',
  templateUrl: './ptm-summary-chart.component.html',
  styleUrls: ['./ptm-summary-chart.component.less'],
  animations: [
    trigger('mouseInOut', [
      state('in', style({
        "opacity":1
      })),
      state('out', style({
        "opacity":0.5
      })),
      transition('in => out', animate('500ms')),
      transition('out => in', animate('500ms'))
    ]),
    trigger('mouseInOutTableRow', [
      state('in', style({
        "background-color": "#c5cde1"
      })),
      state('out', style({
        "background-color": "#ffffff"
      })),
      transition('selected => deselected', animate('500ms')),
      transition('deselected => selected', animate('500ms'))
    ])
  ]
})
export class PtmSummaryChartComponent {
  private _data: any = {}
  extraMetaDataDBID: string = ""
  primaryID: string = ""

  hasExtra: boolean = false


  metaData: any = {}
  ptmPlotArray: any[] = []
  extra: any = {}

  visualizationState: any = {}
  annotationFormMap: any = {}
  @Output() toggleAnnotation: EventEmitter<{ state:boolean, primaryID: string }> = new EventEmitter<{state: boolean, primaryID: string}>()
  @Input() set data(value: PlotDataGeneric) {
    if (value.extraMetaDataDBID && value.df) {
      this.extraMetaDataDBID = value.extraMetaDataDBID
      const extra = this.dataService.extraMetaData.get(this.extraMetaDataDBID)
      if (extra) {
        this.extra = extra
        this.primaryID = value.df.first()[extra.ptmForm.proteinID]

        const data = this.dataService.getExtraMetaData(value.df.first()[value.form.primaryID], this.extraMetaDataDBID)
        if (data) {
          this.metaData = data
          this.hasExtra = true
        }
        const result: any = {
          df: {},
          form: value.form,
          settings: value.settings,
          samples: value.samples,
          plotType: value.plotType,
          extraMetaDataDBID: value.extraMetaDataDBID
        }

        this.ptmPlotArray = value.df.toArray().map((row: any) => {
          this.visualizationState[row[value.form.primaryID]] = row[value.form.primaryID] in value.settings.selectedMap
          const form = this.fb.group({
            toggleAnnotation: [false,],
          })
          form.controls.toggleAnnotation.valueChanges.subscribe((data) => {
            if (data) {
              this.toggleAnnotation.emit({state: data, primaryID: row[value.form.primaryID]})
            }
          })
          this.annotationFormMap[row[value.form.primaryID]] = form
          const res = JSON.parse(JSON.stringify(result))
          res.df = row
          return res
        })
      }
    }
    this._data = value
  }
  get data(): PlotDataGeneric {
    return this._data
  }

  constructor(private dataService: DataService, private fb: FormBuilder) {

  }

  toggleVisual(primaryID: string) {
    this.visualizationState[primaryID] = !this.visualizationState[primaryID]
  }

  mouseIn: boolean = false

  toggleIn() {
    this.mouseIn = true
  }

  toggleOut() {
    this.mouseIn = false
  }

}
