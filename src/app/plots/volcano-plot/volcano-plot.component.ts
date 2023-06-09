import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {DataFrame, IDataFrame} from "data-forge";
import {DataService} from "../../services/data.service";
import {PlotData} from "../../interface/plot-data";
import {FormBuilder} from "@angular/forms";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {VolcanoSelectionModalComponent} from "./volcano-selection-modal/volcano-selection-modal.component";
import {Subject, Subscription} from "rxjs";
import {AnnotationModalComponent} from "./annotation-modal/annotation-modal.component";

@Component({
  selector: 'app-volcano-plot',
  templateUrl: './volcano-plot.component.html',
  styleUrls: ['./volcano-plot.component.less']
})
export class VolcanoPlotComponent implements OnDestroy{
  @Output() formChanged: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output() settingsChanged: EventEmitter<any> = new EventEmitter<any>()

  hasAnnotation: boolean = false
  graphData: any[] = []
  graphLayout: any = {
    height: 700, width: 700, xaxis: {title: "<b>Log2FC</b>"},
    yaxis: {title: "<b>-log10(p-value)</b>"},
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

  config: any = {
    //modeBarButtonsToRemove: ["toImage"]
    toImageButtonOptions: {
      format: 'svg',
      filename: this.graphLayout.title.text,
      height: this.graphLayout.height,
      width: this.graphLayout.width,
      scale: 1
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
    visible: {},
    annotations: {}
  }

  df: IDataFrame = new DataFrame()
  extraMetaDataDBID: string = ""
  plotId = ""
  searchLinkTo = ""
  currentPosition = 0
  @Input() set data(value: PlotData) {
    this.plotId = value.id
    this.searchLinkTo = value.searchLinkTo
    this.dataService.plotUpdateSubjectMap.set(value.searchLinkTo, new Subject<any>())
    this.fcColumn = value.form.foldChange
    this.pValueColumn = value.form.minuslog10pValue
    this.primaryIDColumn = value.form.primaryID
    this.settings = {...value.settings}
    if (value.extraMetaDataDBID) {
      this.extraMetaDataDBID = value.extraMetaDataDBID
    }
    this.form.controls['plotTitle'].setValue(this.settings.plotTitle)
    this.form.controls['pCutOff'].setValue(this.settings.pCutOff)
    this.form.controls['fcCutOff'].setValue(this.settings.fcCutOff)
    this.form.controls['backgroundColorGrey'].setValue(this.settings.backgroundColorGrey)
    this.form.controls['minX'].setValue(this.settings.volcanoAxis.minX)
    this.form.controls['maxX'].setValue(this.settings.volcanoAxis.maxX)
    this.form.controls['minY'].setValue(this.settings.volcanoAxis.minY)
    this.form.controls['maxY'].setValue(this.settings.volcanoAxis.maxY)
    this.df = value.df
    if (value.form.comparisonCol && value.form.comparisonCol !== "") {
      if (value.form.comparison && value.form.comparison !== "") {
        this.df = this.df.where(row => row[value.form.comparisonCol] === value.form.comparison).bake()
      }
    }
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
    this.subscription = this.dataService.searchSubject.get(value.searchLinkTo)?.asObservable().subscribe((value) => {
      if (value) {
        switch (value.operation) {
          case "data-selection":
            if (value.title === "") {
              for (const primaryId of value.primaryIds) {
                this.addDataToSelection(primaryId)
              }
            } else {
              if (!this.settings.categories.includes(value.title)) {
                this.settings.categories.push(value.title)
                this.settings.visible[value.title] = true
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
            break
          case "add-annotation":
            this.annotateDataPoint(value.primaryIds)
            break
          case "remove-annotation":
            this.deleteAnnotation(value.primaryIds)
            break
          case "remove-data-selection":
            break
        }
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
    this.currentPosition = 0
    if (!this.settings.visible) {
      this.settings.visible = {}
    }
    this.graphLayout.title.text = this.form.value.plotTitle
    this.dataService.differentialMap.set(this.plotId, {increase: {}, decrease: {}, notSignificant: {}})


    this.layoutMaxMin = {
      xMin: 0, xMax: 0, yMin: 0, yMax: 0
    }
    const ylog = -Math.log10(this.settings.pCutOff)
    const increase: {[key: string]: {fc: number, p: number, geneNames: string[]}} = {}
    const decrease: {[key: string]: {fc: number, p: number, geneNames: string[]}} = {}
    const notSignificant: {[key: string]: {fc: number, p: number, geneNames: string[]}} = {}

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

    const temp = this.prepareCategories()

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
    //let currentPosition = 0
    for (const row of this.df) {
      const fc = row[this.fcColumn]
      const pValue = row[this.pValueColumn]
      const primaryID = row[this.primaryIDColumn]
      let dataText = primaryID
      let geneNames: string[] = []
      if (this.extraMetaDataDBID) {
        const extra = this.dataService.getExtraMetaData(primaryID, this.extraMetaDataDBID)
        if (extra) {
          dataText = `${extra["Gene Names"]}<br>${primaryID}`
          geneNames = extra["Gene Names"].split(";")
        }
      }


      if (ylog > pValue && Math.abs(fc) > this.settings.fcCutOff) {
        if (fc > 0) {
          increase[primaryID] = {fc, p: pValue, geneNames}
        } else {
          decrease[primaryID] = {fc, p: pValue, geneNames}
        }
      } else {
        notSignificant[primaryID] = {fc, p: pValue, geneNames}
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
            this.settings.colorMap[group] = this.dataService.palette.pastel[this.currentPosition]
            this.currentPosition ++
            if (this.currentPosition === this.dataService.palette.pastel.length) {
              this.currentPosition = 0
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
        if (t in this.settings.visible) {
          temp[t].visible = this.settings.visible[t]
        }
        graphData.push(temp[t])
      }
    }
    this.modifyLayout()
    this.dataService.differentialMap.set(this.plotId, {increase, decrease, notSignificant})
    this.graphData = graphData.reverse()
    this.colorKeys = Object.keys(this.settings.colorMap)
    const annotations: any[] = []
    for (const s in this.settings.annotations) {
      if (this.settings.annotations[s].status) {
        annotations.push(this.settings.annotations[s].data)
      }
    }
    if (this.settings.annotations) {
      this.hasAnnotation = Object.keys(this.settings.annotations).length > 0;
    }

    this.graphLayout.annotations = annotations
    this.form.markAsPristine()
    this.settingsChanged.emit(this.settings)
  }

  prepareCategories() {
    let currentColors: string[] = []
    if (this.settings.colorMap) {
      currentColors = Object.values(this.settings.colorMap)
    }

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
            this.settings.colorMap[s] = this.dataService.palette.pastel[this.currentPosition]
            break
          }
          if (currentColors.indexOf(this.dataService.palette.pastel[this.currentPosition]) !== -1) {
            this.currentPosition ++
          } else if (this.currentPosition !==this.dataService.palette.pastel.length) {
            this.settings.colorMap[s] = this.dataService.palette.pastel[this.currentPosition]
            break
          } else {
            this.breakColor = true
            this.currentPosition = 0
          }
        }

        this.currentPosition ++
        if (this.currentPosition === this.dataService.palette.pastel.length) {
          this.currentPosition = 0
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
      if (temp[s].marker.size === undefined) {
        temp[s].marker.size = this.settings.pointSize

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
    console.log(cutOff)
    this.graphLayout.shapes = cutOff
  }

  markAsDirty() {
    this.form.markAsDirty()
  }

  clickDataPoint(event: any) {
    const primaryID = event.points[0].data.primaryID[event.points[0].pointNumber]
    //this.addDataToSelection(primaryID)
    const extra = this.dataService.getExtraMetaData(primaryID, this.extraMetaDataDBID)
    if (extra) {
      const category = `${extra["Gene Names"]} (${primaryID})`
      this.dataService.searchSubject.get(this.searchLinkTo)?.next(
        {title: category, primaryIds: [primaryID], operation: "data-selection"}
      )
    }

    //this.drawGraph()
    //this.dataService.plotUpdateSubjectMap.get(this.plotId)?.next(true)
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
        this.dataService.searchSubject.get(this.searchLinkTo)?.next(
          {title: result.title, primaryIds: data.map(d => d.primaryID), operation: "data-selection"})
      })
        /*if (result.title !== "") {
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

        this.drawGraph()*/
    }
  }

  addDataToSelection(primaryID: string) {
    const extra = this.dataService.getExtraMetaData(primaryID, this.extraMetaDataDBID)
    if (extra) {
      const category = `${extra["Gene Names"]} (${primaryID})`
      if (!this.settings.categories.includes(category)) {
        this.settings.categories.push(category)
        this.settings.visible[category] = true
        if (!this.settings.selectedMap[primaryID]) {
          this.settings.selectedMap[primaryID] = []
        }
        if (!this.settings.selectedMap[primaryID].includes(category)) {
          this.settings.selectedMap[primaryID].push(category)
        }
      }
    }
  }

  legendClickHandler(event: any) {
    if (event.event.srcElement.__data__[0].trace.visible === "legendonly") {
      this.settings.visible[event.event.srcElement.__data__[0].trace.name] = true
    } else {
      this.settings.visible[event.event.srcElement.__data__[0].trace.name] = "legendonly"
    }
  }

  annotateDataPoint(data: string[]) {
     if (!this.settings.annotations) {
      this.settings.annotations = {}
     }
    const selectedData = this.df.where(r => data.includes(r[this.primaryIDColumn])).bake()
    for (const s of selectedData) {
      if (this.extraMetaDataDBID) {
        const extra = this.dataService.getExtraMetaData(s[this.primaryIDColumn], this.extraMetaDataDBID)
        let dataText = s[this.primaryIDColumn]
        if (extra) {
          dataText = `${extra["Gene Names"]} [${s[this.primaryIDColumn]}]`
        }
        if (!this.settings.annotations[s[this.primaryIDColumn]]) {
          this.settings.annotations[s[this.primaryIDColumn]] = {
            data: {
              xref: 'x',
              yref: 'y',
              x: s[this.fcColumn],
              y: s[this.pValueColumn],
              text: "<b>" + dataText + "</b>",
              showarrow: true,
              arrowhead: 1,
              arrowsize: 1,
              arrowwidth: 1,
              ax: -20,
              ay: -20,
              font: {
                size: 15,
                color: "#000000"
              }
            },
            status: true
          }
        }
      }
    }
    const annotations: any[] = []
    for (const s in this.settings.annotations) {
      if (this.settings.annotations[s].status) {
        annotations.push(this.settings.annotations[s].data)
      }
    }
    this.hasAnnotation = Object.keys(this.settings.annotations).length > 0;
    this.graphLayout.annotations = annotations
  }

  deleteAnnotation(data: string[]) {
    if (!this.settings.annotations) {
      this.settings.annotations = {}
    }
    for (const d of data) {
      delete this.settings.annotations[d]
    }
    const annotations: any[] = []
    for (const s in this.settings.annotations) {
      if (this.settings.annotations[s].status) {
        annotations.push(this.settings.annotations[s].data)
      }
    }
    this.hasAnnotation = Object.keys(this.settings.annotations).length > 0;
    this.graphLayout.annotations = annotations
  }

  openAnnotationModal() {
    const ref = this.modal.open(AnnotationModalComponent, {size: "xl"})
    ref.componentInstance.data = this.settings.annotations
    ref.closed.subscribe((result) => {
      for (const f of result) {
        this.settings.annotations[f.value.annotationID].data.showarrow = f.value.showarrow
        this.settings.annotations[f.value.annotationID].data.arrowhead = f.value.arrowhead
        this.settings.annotations[f.value.annotationID].data.arrowsize = f.value.arrowsize
        this.settings.annotations[f.value.annotationID].data.arrowwidth = f.value.arrowwidth
        this.settings.annotations[f.value.annotationID].data.ax = f.value.ax
        this.settings.annotations[f.value.annotationID].data.ay = f.value.ay
        this.settings.annotations[f.value.annotationID].data.font.size = f.value.fontsize
        this.settings.annotations[f.value.annotationID].data.font.color = f.value.fontcolor
        this.settings.annotations[f.value.annotationID].data.font.text = f.value.text
        this.settings.annotations[f.value.annotationID].status = f.value.showannotation
        const annotations: any[] = []
        for (const s in this.settings.annotations) {
          if (this.settings.annotations[s].status) {
            annotations.push(this.settings.annotations[s].data)
          }
        }
        this.hasAnnotation = Object.keys(this.settings.annotations).length > 0;
        this.graphLayout.annotations = annotations
      }
    })
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe()
  }


}
