import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {DataFrame, IDataFrame} from "data-forge";
import {DataService} from "../../services/data.service";
import {PlotData} from "../../interface/plot-data";
import {FormBuilder} from "@angular/forms";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {VolcanoSelectionModalComponent} from "./volcano-selection-modal/volcano-selection-modal.component";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-volcano-plot',
  templateUrl: './volcano-plot.component.html',
  styleUrls: ['./volcano-plot.component.less']
})
export class VolcanoPlotComponent implements OnDestroy{
  @Output() formChanged: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output() settingsChanged: EventEmitter<any> = new EventEmitter<any>()
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
  plotId = ""

  @Input() set data(value: PlotData) {
    this.plotId = value.id
    this.fcColumn = value.form.foldChange
    this.pValueColumn = value.form.minuslog10pValue
    this.primaryIDColumn = value.form.primaryID
    this.settings = value.settings
    if (value.extraMetaDataDBID) {
      this.extraMetaDataDBID = value.extraMetaDataDBID
    }
    this.form.controls['plotTitle'].setValue(this.settings.plotTitle)
    this.form.controls['pCutOff'].setValue(this.settings.pCutOff)
    this.form.controls['fcCutOff'].setValue(this.settings.fcCutOff)
    this.form.controls['backgroundColorGrey'].setValue(this.settings.backgroundColorGrey)
    this.df = value.df
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
    this.subscription = this.dataService.searchSubject.get(this.plotId)?.asObservable().subscribe((value) => {
      if (value) {
        if (value.title === "") {
          for (const primaryId of value.primaryIds) {
            this.addDataToSelection(primaryId)
          }
        } else {
          if (!this.settings.categories.includes(value.title)) {
            this.settings.categories.push(value.title)
          }
          for (const d of value.primaryIds) {
            if (!this.settings.selectedMap[d]) {
              this.settings.selectedMap[d] = []
            }
            if (!this.settings.selectedMap[d].includes(value.title)) {
              this.settings.selectedMap[d].push(value.title)
            }
          }
        }
        this.drawGraph()
      }
    })

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

  subscription: Subscription|undefined

  constructor(private dataService: DataService, private fb: FormBuilder, private modal: NgbModal) {
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
      if (primaryID in this.settings.selectedMap) {
        for (const category of this.settings.selectedMap[primaryID]) {
          temp[category]["x"].push(fc)
          temp[category]["y"].push(pValue)
          temp[category]["text"].push(dataText)
          temp[category]["primaryID"].push(primaryID)
        }
      } else if (this.settings.backgroundColorGrey) {
        temp["Background"]["x"].push(fc)
        temp["Background"]["y"].push(pValue)
        temp["Background"]["text"].push(dataText)
        temp["Background"]["primaryID"].push(primaryID)
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
            primaryID: [],
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
        temp[group]["primaryID"].push(primaryID)
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

    this.form.markAsPristine()
    this.settingsChanged.emit(this.settings)
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
      primaryID: [],
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
        primaryID: [],
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

  clickDataPoint(event: any) {
    const primaryID = event.points[0].data.primaryID[event.points[0].pointNumber]
    this.addDataToSelection(primaryID)
    this.drawGraph()
  }

  selectDataPoints(event: any) {
    const data: any[] = []
    for (const p of event.points) {
      const primaryID = p.data.primaryID[p.pointNumber]
      const extra = this.dataService.getExtraMetaData(primaryID, this.extraMetaDataDBID)
      const entry: any = {
        primaryID: primaryID,
        x: p.x,
        y: p.y,
      }
      if (extra) {
        entry["geneName"] = extra["Gene Names"]
      }
      data.push(entry)
    }
    if (data.length > 0) {
      const ref = this.modal.open(VolcanoSelectionModalComponent, {size: "lg"})
      ref.componentInstance.data = data
      ref.closed.subscribe((result) => {
        if (result.title !== "") {
          if (!this.settings.categories.includes(result.title)) {
            this.settings.categories.push(result.title)
          }
          for (const d of data) {
            if (!this.settings.selectedMap[d.primaryID]) {
              this.settings.selectedMap[d.primaryID] = []
            }
            if (!this.settings.selectedMap[d.primaryID].includes(result.title)) {
              this.settings.selectedMap[d.primaryID].push(result.title)
            }
          }
        } else {
          for (const d of data) {
            this.addDataToSelection(d.primaryID)
          }
        }

        this.drawGraph()
      })

    }
  }

  addDataToSelection(primaryID: string) {
    const extra = this.dataService.getExtraMetaData(primaryID, this.extraMetaDataDBID)
    if (extra) {
      const category = `${extra["Gene Names"]} (${primaryID})`
      if (!this.settings.categories.includes(category)) {
        this.settings.categories.push(category)
        if (!this.settings.selectedMap[primaryID]) {
          this.settings.selectedMap[primaryID] = []
        }
        if (!this.settings.selectedMap[primaryID].includes(category)) {
          this.settings.selectedMap[primaryID].push(category)
        }
      }
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe()
  }
}
