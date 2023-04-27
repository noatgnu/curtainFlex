import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DataFrame, IDataFrame} from "data-forge";
import {DataService} from "../../services/data.service";
import {PlotData} from "../../interface/plot-data";
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-volcano-plot',
  templateUrl: './volcano-plot.component.html',
  styleUrls: ['./volcano-plot.component.less']
})
export class VolcanoPlotComponent {
  @Output() formChanged: EventEmitter<boolean> = new EventEmitter<boolean>()

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

  colorKeys: string[] = []

  settings: any = {
    plotTitle: "Volcano Plot",
    colorMap: {},
    categories: [],
    volcanoAxis: {minX: 0, maxX: 0, minY: 0, maxY: 0},
    backgroundColorGrey: false,
    selectedMap: {},
    pCutOff: 0.05,
    fcCutOff: 0.6,
    manualAxis: false,
    pointSize: 10,
  }

  df: IDataFrame = new DataFrame()
  extraMetaDataDBID: string = ""
  @Input() set data(value: PlotData) {
    this.fcColumn = value.form.foldChange
    this.pValueColumn = value.form.minuslog10pValue
    this.primaryIDColumn = value.form.primaryID
    this.settings = value.settings
    if (value.extraMetaDataDBID) {
      this.extraMetaDataDBID = value.extraMetaDataDBID
      console.log(this.extraMetaDataDBID)
      console.log(this.dataService.extraMetaData.get(this.extraMetaDataDBID))
    }
    this.form.controls['plotTitle'].setValue(this.settings.plotTitle)
    this.form.controls['pCutOff'].setValue(this.settings.pCutOff)
    this.form.controls['fcCutOff'].setValue(this.settings.fcCutOff)
    this.form.controls['backgroundColorGrey'].setValue(this.settings.backgroundColorGrey)
    this.df = value.df
    this.drawGraph()
  }

  form = this.fb.group({
    plotTitle: ['Volcano plot title',],
    pCutOff: [0.05,],
    fcCutOff: [0.6,],
    backgroundColorGrey: [false,],
    minX: [0,],
    maxX: [0,],
    minY: [0,],
    maxY: [0,],
    manualAxis: [false,],
    pointSize: [10,]
  })

  constructor(private dataService: DataService, private fb: FormBuilder) {
    this.form.valueChanges.subscribe(() => {
      this.formChanged.emit(this.form.dirty)
    })
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

    this.settings.volcanoAxis.minX = this.form.value['minX']
    this.settings.volcanoAxis.maxX = this.form.value['maxX']
    this.settings.volcanoAxis.minY = this.form.value['minY']
    this.settings.volcanoAxis.maxY = this.form.value['maxY']
    this.settings.plotTitle = this.form.value['plotTitle']
    this.settings.manualAxis = this.form.value['manualAxis']
    this.settings.pCutOff = this.form.value['pCutOff']
    this.settings.fcCutOff = this.form.value['fcCutOff']
    this.settings.backgroundColorGrey = this.form.value['backgroundColorGrey']
    this.settings.pointSize = this.form.value['pointSize']


    this.layoutMaxMin.xMin = this.df.getSeries(this.fcColumn).where(i => !isNaN(i)).min()
    this.layoutMaxMin.xMax =this.df.getSeries(this.fcColumn).where(i => !isNaN(i)).max()
    this.layoutMaxMin.yMin = this.df.getSeries(this.pValueColumn).where(i => !isNaN(i)).min()
    this.layoutMaxMin.yMax = this.df.getSeries(this.pValueColumn).where(i => !isNaN(i)).max()
    console.log(this.layoutMaxMin)
    this.graphLayout.xaxis.range = [this.layoutMaxMin.xMin - 0.5, this.layoutMaxMin.xMax + 0.5]
    if (this.settings.manualAxis && this.settings.volcanoAxis.minX) {
      this.graphLayout.xaxis.range[0] = this.settings.volcanoAxis.minX
    }
    if (this.settings.manualAxis && this.settings.volcanoAxis.maxX) {
      this.graphLayout.xaxis.range[1] = this.settings.volcanoAxis.maxX
    }
    this.graphLayout.yaxis.range = [0, this.layoutMaxMin.yMax - this.layoutMaxMin.yMin / 2]
    if (this.settings.manualAxis && this.settings.volcanoAxis.minY) {
      this.graphLayout.yaxis.range[0] = this.settings.volcanoAxis.minY
    }
    if (this.settings.manualAxis && this.settings.volcanoAxis.maxY) {
      this.graphLayout.yaxis.range[1] = this.settings.volcanoAxis.maxY
    }
    let currentPosition = 0
    for (const row of this.df) {
      const fc = row[this.fcColumn]
      const pValue = row[this.pValueColumn]
      const primaryID = row[this.primaryIDColumn]
      let dataText = primaryID
      if (this.extraMetaDataDBID) {
        const extra = this.dataService.getExtraMetaData(primaryID, this.extraMetaDataDBID)
        if (extra) {
          dataText = `${extra["Gene Names"]}<br>${primaryID}`
        }
      }
      console.log(this.settings)
      if (primaryID in this.settings.selectedMap) {
        for (const category of this.settings.selectedMap[primaryID]) {
          temp[category]["x"].push(fc)
          temp[category]["y"].push(pValue)
          temp[category]["text"].push(dataText)
        }
      } else if (this.settings.backgroundColorGrey) {
        temp["Background"]["x"].push(fc)
        temp["Background"]["y"].push(pValue)
        temp["Background"]["text"].push(dataText)
      } else {
        const group = this.dataService.significantGroup(fc, pValue, this.settings.pCutOff, this.settings.fcCutOff)
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
              size: this.settings.pointSize
            }
          }
        }
        temp[group]["x"].push(fc)
        temp[group]["y"].push(pValue)
        temp[group]["text"].push(dataText)
      }
    }
    const graphData: any[] = []
    for (const t in temp) {
      if (temp[t].x.length > 0) {
        graphData.push(temp[t])
      }
    }

    this.modifyLayout()

    this.graphData = graphData.reverse()
    this.colorKeys = Object.keys(this.settings.colorMap)
    console.log(this.graphData)
    this.form.markAsPristine()
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
      name: "Background",
      marker: {
        color: "#a4a2a2",
        opacity: 0.3,
        size: this.settings.pointSize
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
          color: this.settings.colorMap[s],
          size: this.settings.pointSize
        }
      }
    }
    return temp
  }

  modifyLayout() {
    const cutOff: any[] = []
    cutOff.push({
      type: "line",
      x0: -this.settings.fcCutOff,
      x1: -this.settings.fcCutOff,
      y0: 0,
      y1: this.graphLayout.yaxis.range[1],
      line: {
        color: 'rgb(21,4,4)',
        width: 1,
        dash: 'dot'
      }
    })
    cutOff.push({
      type: "line",
      x0: this.settings.fcCutOff,
      x1: this.settings.fcCutOff,
      y0: 0,
      y1: this.graphLayout.yaxis.range[1],
      line: {
        color: 'rgb(21,4,4)',
        width: 1,
        dash: 'dot'
      }
    })

    let x0 = this.layoutMaxMin.xMin - 1
    if (this.settings.volcanoAxis.minX) {
      x0 = this.settings.volcanoAxis.minX - 1
    }
    let x1 = this.layoutMaxMin.xMax + 1
    if (this.settings.volcanoAxis.maxX) {
      x1 = this.settings.volcanoAxis.maxX + 1
    }
    cutOff.push({
      type: "line",
      x0: x0,
      x1: x1,
      y0: -Math.log10(this.settings.pCutOff),
      y1: -Math.log10(this.settings.pCutOff),
      line: {
        color: 'rgb(21,4,4)',
        width: 1,
        dash: 'dot'
      }
    })
    this.graphLayout.shapes = cutOff
  }

  markAsDirty() {
    this.form.markAsDirty()
  }
}
