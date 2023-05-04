import {Component, Input} from '@angular/core';
import {DataFrame, IDataFrame, ISeries, Series} from "data-forge";
import {DataService} from "../../services/data.service";
import {PlotDataGeneric} from "../../interface/plot-data";

@Component({
  selector: 'app-bar-chart',
  templateUrl: './protein-summary-chart.component.html',
  styleUrls: ['./protein-summary-chart.component.less']
})
export class ProteinSummaryChartComponent {
  graphData: any[] = []
  graphDataAverage: any[] = []
  graphDataViolin: any[] = []

  graphLayout: any = {
    xaxis: {
      tickfont: {
        size: 17,
        color: "black",
      },
      tickvals: [],
      ticktext: [],
      fixedrange: true
    },
    yaxis: {
      tickfont: {
        size: 17,
        color: "black",
      },
      fixedrange: true
    },
    annotations: [],
    shapes: [],
    margin: {r: 50, l: 50, b: 100, t: 100},
    title: {
      text: "",
    }
  }

  graphLayoutAverage: any = {
    xaxis: {
      tickfont: {
        size: 17,
        color: "black",
      },
      tickvals: [],
      ticktext: [],
      fixedrange: true
    },
    yaxis: {
      tickfont: {
        size: 17,
        color: "black",
      },
      fixedrange: true
    },
    annotations: [],
    shapes: [],
    margin: {r: 40, l: 40, b: 120, t: 100},
    title: {
      text: "",
    }
  }

  graphLayoutViolin: any = {
    xaxis: {
      tickfont: {
        size: 17,
        color: "black",
      },
      tickvals: [],
      ticktext: [],
      fixedrange: true
    },
    yaxis: {
      tickfont: {
        size: 17,
        color: "black",
      },
      fixedrange: true
    },
    annotations: [],
    shapes: [],
    margin: {r: 40, l: 40, b: 120, t: 100},
    title: {
      text: "",
    }
  }

  settings: any = {
    plotTitle: "Bar Chart",
    colorMap: {},
    sampleVisibility: {},
    categories: [],
    selectedMap: {},
    barChartErrorType: "Standard Error",
  }

  df: any = {}

  samples: any[] = []

  extraMetaDataDBID: string = ""
  primaryID: string = ""
  geneName: string = ""
  proteinName: string = ""
  @Input() set data(value: PlotDataGeneric) {
    this.samples = value.samples
    for (const s in value.settings) {
      if (value.settings.hasOwnProperty(s)) {
        this.settings[s] = value.settings[s]
      }
    }
    this.df = value.df
    this.primaryID = value.df[value.form.primaryID]
    if (value.extraMetaDataDBID) {
      this.extraMetaDataDBID = value.extraMetaDataDBID
      const data = this.dataService.getExtraMetaData(this.primaryID, this.extraMetaDataDBID)
      if (data) {

        this.settings.plotTitle = `${data["Gene Names"]}<br>${value.df[value.form.primaryID]}`
        this.geneName = data["Gene Names"]
        this.proteinName = data["Protein names"]
      }
    }
    this.drawGraph()
    this.drawGraphAverage()
  }

  constructor(private dataService: DataService) {

  }

  drawGraph() {
    this.graphLayout.title.text = this.settings.plotTitle
    const tickvals: string[] = []
    const ticktext: string[] = []
    const graph: any = {}
    this.graphData = []
    const shapes: any[] = []
    let sampleNumber: number = 0
    for (const s of this.samples) {
      if (this.settings.sampleVisibility[s.column]) {
        sampleNumber ++
        const condition = s.condition
        let color = this.settings.colorMap[condition]
        if (!graph[condition]) {
          graph[condition] = {
            x: [],
            y: [],
            type: "bar",
            marker: {
              color: color
            },
            name: condition,
            showlegend: false
          }
        }
        graph[condition].x.push(s.column)
        // @ts-ignore
        graph[condition].y.push(this.df[s.column])
      }
    }
    let currentSampleNumber = 0
    for (const g in graph) {
      const annotationsPosition = currentSampleNumber +  graph[g].x.length/2
      currentSampleNumber = currentSampleNumber + graph[g].x.length
      this.graphData.push(graph[g])
      tickvals.push(graph[g].x[Math.round(graph[g].x.length/2)-1])
      ticktext.push(g)
      if (sampleNumber !== currentSampleNumber) {
        shapes.push({
          type: "line",
          xref: "paper",
          yref: "paper",
          x0: currentSampleNumber/sampleNumber,
          x1: currentSampleNumber/sampleNumber,
          y0: 0,
          y1: 1,
          line: {
            dash: "dash",
          }
        })
      }
    }
    this.graphLayout.shapes = shapes

    this.graphLayout.xaxis.tickvals = tickvals
    this.graphLayout.xaxis.ticktext = ticktext
  }

  drawGraphAverage() {
    this.graphLayoutAverage.title.text = this.settings.plotTitle
    const tickvals: string[] = []
    const ticktext: string[] = []
    const graph: any = {}
    const graphData: any[] = []
    const graphViolin: any[] = []
    this.graphDataAverage = []
    this.graphDataViolin = []
    let sampleNumber: number = 0
    for (const s of this.samples) {
      if (this.settings.sampleVisibility[s.column]) {
        sampleNumber ++
        if (!graph[s.condition]) {
          graph[s.condition] = []
        }
        graph[s.condition].push(this.df[s.column])
      }
    }
    for (const g in graph) {
      let color = this.settings.colorMap[g]
      const box: any = {
        x: g,
        y: graph[g],
        type: "box",
        boxpoints: "all",
        pointpos: 0,
        jitter: 0.3,
        fillcolor: 'rgba(255,255,255,0)',
        line: {
          color: 'rgba(255,255,255,0)'
        },
        hoveron: 'points',
        marker: {
          color: "#654949",
          opacity: 0.8
        },
        name: g,
        showlegend: false
      }
      const violinX: any[] = graph[g].map(() =>g)
      const violin: any = {
        type: 'violin',
        x: violinX,
        y: graph[g],
        points: 'all',
        box: {
          visible: true,
        },
        meanline: {
          visible: true,
        },
        line: {
          color: "black",
        },
        fillcolor: color,
        name: g,
        showlegend: false,
        spanmode: "soft"
      }
      graphViolin.push(violin)
      const s: Series<number, any> = new Series(graph[g])
      const std = s.std()
      const standardError = std/Math.sqrt(s.count())
      let total = 0
      let countNotNull = 0
      for (const i of s) {
        if (i) {
          total = total + i
          countNotNull = countNotNull + 1
        }
      }
      const mean = total/countNotNull
      let error = std
      switch (this.settings.barChartErrorType) {
        case "Standard Error":
          error = standardError
          break
        default:
          break
      }
      graphData.push({
        x: [g], y: [mean],
        type: 'bar',
        mode: 'markers',
        error_y: {
          type: 'data',
          array: [error],
          visible: true
        },
        marker: {
          "color": color
        },
        line: {
          color: "black"
        },
        //visible: temp[t].visible,
        showlegend: false
      })
      graphData.push(box)
      tickvals.push(g)
      ticktext.push(g)
    }
    this.graphDataAverage = graphData
    this.graphDataViolin = graphViolin
    this.graphLayoutAverage.xaxis.tickvals = tickvals
    this.graphLayoutAverage.xaxis.ticktext = ticktext
    this.graphLayoutViolin.xaxis.tickvals = tickvals
    this.graphLayoutViolin.xaxis.ticktext = ticktext
  }
}
