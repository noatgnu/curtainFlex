import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-protein-domain',
  templateUrl: './protein-domain.component.html',
  styleUrls: ['./protein-domain.component.less']
})
export class ProteinDomainComponent {
  private _data: any[] = []
  geneName = ""
  @Input() set data(value: any) {
    let last = 1
    const waterfallPlot: any = {
      type: "waterfall",
      orientation: "h",
      measure: [],
      y: [],
      x: [],
      connector: {
        mode: "between"
      },
      text: [],
      hoverinfo: "text",
      base: 1
    }
    this.geneName = value["Gene Names"]
    const domains: any[] = []
    let l = 0
    for (const s of value["Domain [FT]"].split(/;/g)) {
      if (s !== "") {
        if (s.indexOf("DOMAIN") > -1) {
          domains.push({})
          l = domains.length
          for (const match of s.matchAll(/(\d+)/g)) {
            if (!("start" in domains[l-1])) {
              domains[l-1].start = parseInt(match[0])
            } else {
              domains[l-1].end = parseInt(match[0])
            }
          }
        } else if (s.indexOf("/note=") > -1) {
          const match = /"(.+)"/.exec(s)
          if (match !== null) {
            domains[l-1].name = match[1]
          }
        }
      }
    }
    value["Domain [FT]"] = domains
    for (const d of value["Domain [FT]"]) {
      if (d.start-1 > last) {
        waterfallPlot.measure.push("relative")
        waterfallPlot.y.push("Other")
        waterfallPlot.x.push(d.start-last)
        if (last !== 1) {
          waterfallPlot.text.push((last+1) + " - " + (d.start-1) + "; " + "Other")
        } else {
          waterfallPlot.text.push(1 + " - " + (d.start-1) + "; " + "Other")
        }

        last = d.start-1

      }
      waterfallPlot.measure.push("relative")
      waterfallPlot.y.push(d.name)
      waterfallPlot.x.push(d.end-last)
      waterfallPlot.text.push(d.start + " - " + (d.end) + "; " + d.name)
      last = d.end
    }
    if (parseInt(value["Length"]) - 1 > last) {
      waterfallPlot.measure.push("relative")
      waterfallPlot.y.push("Other")
      waterfallPlot.x.push(parseInt(value["Length"])-last)
      if (last !== 1) {
        waterfallPlot.text.push((last+1) + " - " + parseInt(value["Length"])+ "; " + "Other")
      } else {
        waterfallPlot.text.push(1 + " - " + parseInt(value["Length"]) + "; " + "Other")
      }
    }
    this._data = [waterfallPlot]
  }

  get data(): any[] {
    return this._data
  }

  layout: any = {
    title: {
      text: "Protein Domains"
    },
    yaxis: {
      type: "category"
    }, width: 1000,
    xaxis: {
      type: "linear",
      showgrid: false,
      zeroline: false,
      showline: false,
      autotick: true,
      ticks: '',
      showticklabels: false
    }, margin: {t: 25, b: 25, r: 125, l: 175},
    showlegend: false
  }

  config: any = {
    //modeBarButtonsToRemove: ["toImage"]
    toImageButtonOptions: {
      format: 'svg',
      filename: `protein_domain`,
      height: this.layout.height,
      width: this.layout.width,
      scale: 1
    }
  }
  constructor() { }


}
