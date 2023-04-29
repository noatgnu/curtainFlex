import {Component, Input} from '@angular/core';
import {PlotData, PlotDataGeneric} from "../../interface/plot-data";
import {DataFrame, IDataFrame} from "data-forge";
import {DataService} from "../../services/data.service";

@Component({
  selector: 'app-chart-deck',
  templateUrl: './chart-deck.component.html',
  styleUrls: ['./chart-deck.component.less']
})
export class ChartDeckComponent {
  _data: PlotData = {
    df: new DataFrame(),
    form: null,
    settings: null,
    samples: [],
    plotType: ""
  }
  filteredData: IDataFrame = new DataFrame()
  plotDataArray: PlotDataGeneric[] = []

  page: number = 1

  pageSize: number = 5

  @Input() set data(value: PlotData) {
    if (value !== this._data) {
      this.plotDataArray = []
      this.filteredData = new DataFrame()
      this._data = value
      for (let i = 0; i < this._data.samples.length; i++) {
        if (!(this._data.samples[i].condition in this._data.settings.colorMap)) {
          const colorIndex = i % this.dataService.palette.pastel.length
          this._data.settings.colorMap[this._data.samples[i].condition] = this.dataService.palette.pastel[colorIndex]
        }
      }

      if (this._data.df.count() > 0) {
        this.filteredData = this._data.df.where((row: any) => row[this._data.form.primaryID] in value.settings.selectedMap).bake()
        if (this.filteredData.count() === 0) {
          this.filteredData = this._data.df
        }

        const result: any = {
          df: {},
          form: this._data.form,
          settings: this._data.settings,
          samples: this._data.samples,
          plotType: this._data.plotType,
          extraMetaDataDBID: this._data.extraMetaDataDBID
        }

        this.plotDataArray = this.filteredData.toArray().map((row: any) => {
          const res = JSON.parse(JSON.stringify(result))
          res.df = row
          if (this._data.extraMetaDataDBID) {
            const data = this.dataService.getExtraMetaData(row[this._data.form.primaryID], this._data.extraMetaDataDBID)
            console.log(data)
          }

          return res
        })
        console.log(this.plotDataArray)
      }

    }
  }

  get data() {
    return this._data
  }

  constructor(private dataService: DataService) {

  }

}
