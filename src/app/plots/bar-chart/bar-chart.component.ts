import {Component, Input} from '@angular/core';
import {DataFrame, IDataFrame} from "data-forge";
import {DataService} from "../../services/data.service";
import {PlotDataGeneric} from "../../interface/plot-data";

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.less']
})
export class BarChartComponent {
  graphData: any[] = []
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

  settings: any = {
    plotTitle: "Bar Chart",
    colorMap: {},
    sampleVisibility: {},
    categories: [],
    selectedMap: {},
  }

  df: IDataFrame = new DataFrame()

  samples: any[] = []

  @Input() set data(value: PlotDataGeneric) {
    this.samples = value.samples
    this.settings = value.settings
    this.df = value.df
    this.drawGraph()
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
}
