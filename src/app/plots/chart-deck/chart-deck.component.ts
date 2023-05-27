import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {PlotData, PlotDataGeneric} from "../../interface/plot-data";
import {DataFrame, IDataFrame, ISeries, Series} from "data-forge";
import {DataService} from "../../services/data.service";
import {Subscription} from "rxjs";
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-chart-deck',
  templateUrl: './chart-deck.component.html',
  styleUrls: ['./chart-deck.component.less'],
  animations: [

  ]
})
export class ChartDeckComponent implements OnDestroy{
  @Output() settingsChanged: EventEmitter<any> = new EventEmitter()
  _data: PlotData = {
    id: "",
    filename: "",
    df: new DataFrame(),
    form: null,
    settings: null,
    samples: [],
    plotType: "",
    searchLinkTo: "",
    ptm: false,
  }
  filteredData: IDataFrame = new DataFrame()
  filteredPTMData: ISeries<number, IDataFrame> = new Series()
  plotDataArray: PlotDataGeneric[] = []

  page: number = 1

  pageSize: number = 5
  relatedVolcano: any = {}
  @Input() set data(value: PlotData) {
    if (value !== this._data) {
      console.log(value)
      this.plotDataArray = []
      this.filteredData = new DataFrame()
      this._data = value
      const relatedVolcano = this.dataService.plotLists.find(x => x.filename === value.extraMetaDataDBID && x.plotType==="volcano-plot")
      if (relatedVolcano) {
        this.relatedVolcano = relatedVolcano
      }
      for (let i = 0; i < this._data.samples.length; i++) {
        if (!(this._data.samples[i].condition in this._data.settings.colorMap)) {
          const colorIndex = i % this.dataService.palette.pastel.length
          this._data.settings.colorMap[this._data.samples[i].condition] = this.dataService.palette.pastel[colorIndex]
        }
      }
      this.filterDataForDisplay();
      console.log(this.plotDataArray)
      if (this.subscription) {
        this.subscription.unsubscribe()
      }
      if (this.data.searchLinkTo) {
        this.subscription = this.dataService.searchSubject.get(this.data.searchLinkTo)?.subscribe((data: any) => {
          if (data) {
            switch (data.operation) {
              case "data-selection":
                if (data.primaryIds.length > 0) {
                  for (const primaryId of data.primaryIds) {
                    if (!(primaryId in this.data.settings.selectedMap)) {
                      this.data.settings.selectedMap[primaryId] = []
                    }
                    this.data.settings.selectedMap[primaryId] = []
                    this.filterDataForDisplay()
                  }
                }
                break
            }
          }
        })
      }

    }
  }

  private filterDataForDisplay() {
    if (this._data.df.count() > 0) {
      const result: any = {
        df: {},
        form: this._data.form,
        settings: this._data.settings,
        samples: this._data.samples,
        plotType: this._data.plotType,
        searchLinkTo: this._data.searchLinkTo,
        extraMetaDataDBID: this._data.extraMetaDataDBID
      }
      if (this._data.ptm !== true) {
        this.filteredData = this._data.df.where((row: any) => row[this._data.form.primaryID] in this.data.settings.selectedMap).bake()
        if (this.filteredData.count() === 0) {
          this.filteredData = this._data.df
        }



        this.plotDataArray = this.filteredData.toArray().map((row: any) => {
          const res = JSON.parse(JSON.stringify(result))
          res.df = row
          return res
        })
        this.settingsChanged.emit(this.data.settings)
      } else {
        if (this._data.extraMetaDataDBID) {
          const ptmData = this.dataService.data.files.get(this._data.extraMetaDataDBID)
          const extra = this.dataService.extraMetaData.get(this._data.extraMetaDataDBID)
          console.log(ptmData)
          console.log(extra)
          let df: IDataFrame = new DataFrame()
          if (this._data.extraMetaDataDBID !== this._data.filename) {
            if (extra && ptmData) {
              df = this._data.df.join(ptmData.df, left => left[this._data.form.primaryID], right => right[extra.form.primaryID], (left, right) => {
                return {
                  ...left,
                  ...right
                }
              }).bake()
            }
          } else {
            if (extra && ptmData) {
              if (extra && ptmData) {
                df = this._data.df
              }
            }
          }
          if (Object.keys(this._data.settings.selectedMap).length > 0) {
            this.filteredPTMData = df.groupBy(row => row[extra.ptmForm.proteinID])
              .filter(group => group.getSeries(this._data.form.primaryID)
                .any(r => r in this.data.settings.selectedMap)).bake()

          } else {
            this.filteredPTMData = df.groupBy(row => row[extra.ptmForm.proteinID]).bake()
          }
          this.plotDataArray = this.filteredPTMData.toArray().map((row: any) => {
            const res = JSON.parse(JSON.stringify(result))
            res.df = row
            return res
          })
        }
      }
    }
  }

  get data() {
    return this._data
  }
  subscription: Subscription|undefined
  constructor(private dataService: DataService) {

  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  annotationHandler(event: boolean, primaryID: string) {
    if (!this.data.settings.annotations) {
      this.data.settings.annotations = {}
    }
    this.data.settings.annotations[primaryID] = event
    if (event) {
      this.dataService.searchSubject.get(this.data.searchLinkTo)?.next({
        operation: "add-annotation", primaryIds: [primaryID]
      })
    } else {
      this.dataService.searchSubject.get(this.data.searchLinkTo)?.next({
        operation: "remove-annotation", primaryIds: [primaryID]
      })
    }

  }

  ptmAnnotationHandler(event: {state: boolean, primaryID: string}) {
    this.annotationHandler(event.state, event.primaryID)
  }
}
