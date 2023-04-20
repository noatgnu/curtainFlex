import {Component, Input} from '@angular/core';
import {DataFrame, IDataFrame} from "data-forge";
import {DataService} from "../../services/data.service";

@Component({
  selector: 'app-volcano-plot',
  templateUrl: './volcano-plot.component.html',
  styleUrls: ['./volcano-plot.component.less']
})
export class VolcanoPlotComponent {
  graphData: any[] = []
  graphLayout: any = {
    height: 700, width: 700, xaxis: {title: "Log2FC"},
    yaxis: {title: "-log10(p-value)"},
    annotations: [],
    showlegend: true, legend: {
      orientation: 'h'
    },
    title: {
      text: "Volcano Plot",
      font: {
        size: 24
      },
    }
  }

  fcColumn: string = ""
  pValueColumn: string = ""
  primaryIDColumn: string = ""

  settings: any = {
    plotTitle: "Volcano Plot",
    colorMap: {},
    categories: [],
    volcanoAxis: {minX: 0, maxX: 0, minY: 0, maxY: 0},
    backGroundColorGrey: false,
    selectedMap: {},
    pCutOff: 0.05,
    fcCutOff: 0.6,
  }

  df: IDataFrame = new DataFrame()

  @Input() set data(value: {df: IDataFrame, form: any, settings: any}) {
    console.log(value)
    this.fcColumn = value.form.foldChange
    this.pValueColumn = value.form.minuslog10pValue
    this.primaryIDColumn = value.form.primaryID
    this.settings = value.settings
    this.df = value.df
    this.drawGraph()
  }

  constructor(private dataService: DataService) {

  }

  breakColor: boolean = false
  layoutMaxMin: any = {
    xMin: 0, xMax: 0, yMin: 0, yMax: 0
  }
  drawGraph() {
    this.graphLayout.title.text = this.settings.plotTitle
    const temp = this.prepareCategories()
    this.layoutMaxMin = {
      xMin: 0, xMax: 0, yMin: 0, yMax: 0
    }


    this.graphLayout.xaxis.range = [this.layoutMaxMin.xMin - 0.5, this.layoutMaxMin.xMax + 0.5]
    if (this.settings.volcanoAxis.minX) {
      this.graphLayout.xaxis.range[0] = this.settings.volcanoAxis.minX
    }
    if (this.settings.volcanoAxis.maxX) {
      this.graphLayout.xaxis.range[1] = this.settings.volcanoAxis.maxX
    }
    this.graphLayout.yaxis.range = [0, this.layoutMaxMin.yMax - this.layoutMaxMin.yMin / 2]
    if (this.settings.volcanoAxis.minY) {
      this.graphLayout.yaxis.range[0] = this.settings.volcanoAxis.minY
    }
    if (this.settings.volcanoAxis.maxY) {
      this.graphLayout.yaxis.range[1] = this.settings.volcanoAxis.maxY
    }
    let currentPosition = 0
    this.df.forEach((row:any) => {
      if (row[this.fcColumn] && row[this.pValueColumn] && row[this.primaryIDColumn]) {
        const fc = row[this.fcColumn]
        const pValue = row[this.pValueColumn]
        const primaryID = row[this.primaryIDColumn]
        if (primaryID in this.settings.selectedMap) {
          for (const category of this.settings.selectedMap[primaryID]) {
            temp[category]["x"].push(fc)
            temp[category]["y"].push(pValue)
            temp[category]["text"].push(primaryID)
          }
        } else if (this.settings.backGroundColorGrey) {
          temp["Background"]["x"].push(fc)
          temp["Background"]["y"].push(pValue)
          temp["Background"]["text"].push(primaryID)
        } else {
          const group = this.dataService.significantGroup(pValue, fc, this.settings.pCutOff, this.settings.fcCutOff)
          if (!(group in temp)) {
            if (!(group in this.settings.colorMap)) {
              this.settings.colorMap[group] = this.dataService.palette.pastel[currentPosition]
              currentPosition ++
              if (currentPosition === this.dataService.palette.pastel.length) {
                currentPosition = 0
              }
            }
            temp[group] = {
              x: [],
              y: [],
              text: [],
              type: "scattergl",
              mode: "markers",
              name: group,
              marker: {
                color: this.settings.colorMap[group],
              }
            }
          }
        }
      }
    })


  }

  prepareCategories() {
    let currentColors: string[] = []
    if (this.settings.colorMap) {
      currentColors = Object.values(this.settings.colorMap)
    }
    let currentPosition = 0
    let temp: any = {}
    temp["Background"] = {
      x:[],
      y:[],
      text: [],
      type: "scattergl",
      mode: "markers",
      name: "Background"
    }
    if (this.settings.backGroundColorGrey) {
      temp["Background"]["marker"] = {
        color: "#a4a2a2",
        opacity: 0.3,
      }
    }

    for (const s of this.settings.categories) {
      if (!this.settings.colorMap[s]) {
        while (true) {
          if (this.breakColor) {
            this.settings.colorMap[s] = this.dataService.palette.pastel[currentPosition]
            break
          }
          if (currentColors.indexOf(this.dataService.palette.pastel[currentPosition]) !== -1) {
            currentPosition ++
          } else if (currentPosition !==this.dataService.palette.pastel.length) {
            this.settings.colorMap[s] = this.dataService.palette.pastel[currentPosition]
            break
          } else {
            this.breakColor = true
            currentPosition = 0
          }
        }

        currentPosition ++
        if (currentPosition === this.dataService.palette.pastel.length) {
          currentPosition = 0
        }
      }

      temp[s] = {
        x: [],
        y: [],
        text: [],
        type: "scattergl",
        mode: "markers",
        name: s,
        marker: {
          color: this.settings.colorMap[s]
        }
      }
    }
    return temp
  }
}
