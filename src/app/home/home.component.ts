import { Component } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {DataService} from "../services/data.service";
import {AccountsService} from "../services/accounts.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent {
  constructor(private route: ActivatedRoute, private data: DataService, private accounts: AccountsService) {
    this.route.params.subscribe(params => {

      if (params["settings"]) {
        if (params["settings"] && params["settings"].startsWith("access_token")){
          console.log(params["settings"])
        } else if (params["settings"] && params["settings"].length > 0) {
          const settings = params["settings"].split("&")
          let token: string = ""
          if (settings.length > 1) {
            token = settings[1]
            this.data.currentSession.tempLink = true
          } else {
            this.data.currentSession.tempLink = false
          }
          if (this.data.currentSession.id !== settings[0]) {
            this.data.currentSession.id = settings[0]
            this.data.currentSession.link = location.origin + "/#/" + this.data.currentSession.id
            this.accounts.curtainAPI.getSessionSettings(settings[0]).then((d:any)=> {
              this.data.currentSession.data = d.data
              console.log(d)
              this.accounts.curtainAPI.postSettings(settings[0], token).then((data:any) => {
                console.log(data)
                let jsonData: any
                if (d.data.curtain_type === "F") {
                  jsonData = data.data
                } else if (d.data.curtain_type === "TP") {
                  if (typeof data.data.settings === "string") {
                    data.data.settings = JSON.parse(data.data.settings)
                  }
                  jsonData = this.convertCurtainToCurtainFlex(data);
                } else if (d.data.curtain_type === "PTM") {

                }
                console.log(jsonData)
                if (jsonData) {
                  this.data.processJSON(jsonData).then()
                }
                this.accounts.curtainAPI.getOwnership(settings[0]).then((data:any) => {
                  if (data.ownership) {
                    this.accounts.isOwner = true
                  } else {
                    this.accounts.isOwner = false
                  }
                }).catch(error => {
                  this.accounts.isOwner = false
                })
              })
            })
          }
        }
      }
    })
  }

  private convertCurtainToCurtainFlex(data: any) {
    const jsonData: any = {}
    jsonData.data = {filenameList: [], files: {}}
    jsonData.data.filenameList.push("processed.txt")
    jsonData.data.files["processed.txt"] = {
      df: "",
      extraMetaDataDBID: "processed.txt",
      filename: "processed.txt",
      originalFile: data.data.processed,
    }
    jsonData.data.filenameList.push("raw.txt")
    jsonData.data.files["raw.txt"] = {
      df: "",
      extraMetaDataDBID: "processed.txt",
      filename: "raw.txt",
      originalFile: data.data.raw,
    }
    jsonData.extraMetaData = {
      "processed.txt": {
        "form": {
          "column": "",
          "enableLink": false,
          "linkTo": "",
          "primaryID": "",
          "ptm": false,
          "source": "uniprot"
        },
        "ptmForm": {
          "LocalizationProbability": "",
          "foldChange": "",
          "minuslog10pValue": "",
          "peptideSequence": "",
          "positionInPeptide": "",
          "positionInProtein": "",
          "proteinID": "",
        }
      },
      "raw.txt": {
        "form": {
          "column": "",
          "enableLink": true,
          "linkTo": "processed.txt",
          "primaryID": "",
          "ptm": false,
          "source": "uniprot"
        },
        "ptmForm": {
          "LocalizationProbability": "",
          "foldChange": "",
          "minuslog10pValue": "",
          "peptideSequence": "",
          "positionInPeptide": "",
          "positionInProtein": "",
          "proteinID": "",
        }
      }
    }

    jsonData.plotLists = []
    const volcanoPlotID = crypto.randomUUID()
    const barChartPlotID = crypto.randomUUID()
    if ("dataColumns" in data.data.settings) {
      jsonData.extraMetaData["processed.txt"].form.column = data.data.settings.dataColumns.processedIdentifierCol
      jsonData.extraMetaData["processed.txt"].form.primaryID = data.data.settings.dataColumns.processedIdentifierCol

      const categories: string[] = []
      const selectedMap: any = {}
      for (const s in data.data.selections) {
        categories.push(s)
        for (const c of data.data.selections[s]) {
          if (!selectedMap[c]) {
            selectedMap[c] = []
          }
          selectedMap[c].push(s)
        }
      }

      jsonData.plotLists.push({
        df: "",
        extraMetaDataDBID: "processed.txt",
        filename: "processed.txt",
        form: {
          foldChange: data.data.settings.dataColumns.processedLog2FC,
          minuslog10pValue: data.data.settings.dataColumns.processedPValue,
          performMinuslog10Transform: !data.data.settings.antilogP,
          performlog2Transform: false,
          primaryID: data.data.settings.dataColumns.processedIdentifierCol,
          comparisonCol: data.data.settings.dataColumns.processedCompLabel,
          comparison: data.data.settings.dataColumns.comparison,
        },
        id: volcanoPlotID,
        plotType: "volcano-plot",
        ptm: false,
        samples: [],
        searchLinkTo: volcanoPlotID,
        settings: {
          annotations: {},
          backgroundColorGrey: false,
          categories: categories,
          colorMap: {},
          fcCutOff: data.data.settings.logFCCutOff,
          id: volcanoPlotID,
          manualAxis: false,
          pCutOff: data.data.settings.pCutOff,
          plotTitle: "Volcano Plot",
          pointSize: 10,
          selectedMap: selectedMap,
          visible: {},
          volcanoAxis: {
            minX: 0, maxX: 0, minY: 0, maxY: 0
          }
        }
      })

      const samples = data.data.settings.dataColumns.rawSamplesCol.map((sample: string) => {
        const split = sample.split('.')
        if (split.length > 1) {
          return {condition: split.slice(0, split.length - 1).join("_") ,replicate: split[split.length - 1], column: sample}
        } else {
          return {condition: sample, replicate: '', column: sample}
        }
      })
      const sampleVisibility: any = {}
      for (const s of samples) {
        sampleVisibility[s.column] = true
      }
      jsonData.plotLists.push({
        df: "",
        extraMetaDataDBID: "processed.txt",
        filename: "raw.txt",
        form: {
          primaryID: data.data.settings.dataColumns.rawIdentifierCol,
          samples: data.data.settings.dataColumns.rawSamplesCol,
          comparisonCol: "",
          comparison: "",
        },
        id: barChartPlotID,
        plotType: "bar-chart",
        ptm: false,
        samples: samples,
        searchLinkTo: volcanoPlotID,
        settings: {
          plotTitle: "Bar Chart",
          colorMap: {},
          sampleVisibility: sampleVisibility,
          categories: categories,
          selectedMap: selectedMap,
          barChartErrorType: "Standard Error",
          annotations: {}
        }
      })
    } else {
      jsonData.extraMetaData["processed.txt"].form.column = data.data.differentialForm._primaryIDs
      jsonData.extraMetaData["processed.txt"].form.primaryID = data.data.differentialForm._primaryIDs
      const annotations: any = {}
      for (const a in data.data.annotatedData) {
        const match = /\(([^)]*)\)[^(]*$/.exec(a)
        if (match) {
          annotations[match[1]] = {data:
              {
                xref: 'x',
                yref: 'y',
                x: data.data.annotatedData[a].x,
                y: data.data.annotatedData[a].y,
                text: data.data.annotatedData[a].text,
                showarrow: true,
                arrowhead: 1,
                arrowsize: data.data.annotatedData[a].arrowsize,
                arrowwidth: 1,
                ax: -20,
                ay: -20,
                font: {
                  size: data.data.annotatedData[a].font.size,
                  color: "#000000"
                }
              },
            status: true}
        }
      }
      const samples = data.data.rawForm._samples.map((sample: string) => {
        const split = sample.split('.')
        if (split.length > 1) {
          return {condition: split.slice(0, split.length - 1).join("_") ,replicate: split[split.length - 1], column: sample}
        } else {
          return {condition: sample, replicate: '', column: sample}
        }
      })
      const selectedMap: any = {}
      for (const s in data.data.selectionsMap) {
        selectedMap[s] = Object.keys(data.data.selectionsMap[s])
      }
      const colorMap: any = {}
      for (const c of data.data.selectionsName) {
        if (c in data.data.settings.colorMap) {
          colorMap[c] = data.data.settings.colorMap[c]
        }
      }
      jsonData.plotLists.push({
        df: "",
        extraMetaDataDBID: "processed.txt",
        filename: "processed.txt",
        form: {
          foldChange: data.data.differentialForm._foldChange,
          minuslog10pValue: data.data.differentialForm._significant,
          performMinuslog10Transform: data.data.differentialForm._transformSignificant,
          performlog2Transform: data.data.differentialForm._transformFC,
          primaryID: data.data.differentialForm._primaryIDs,
          comparisonCol: data.data.differentialForm._comparison,
          comparison: data.data.differentialForm._comparisonSelect[0],
        },
        id: volcanoPlotID,
        plotType: "volcano-plot",
        ptm: false,
        samples: [],
        searchLinkTo: volcanoPlotID,
        settings: {
          annotations: annotations,
          backgroundColorGrey: false,
          categories: data.data.selectionsName.slice(),
          colorMap: colorMap,
          fcCutOff: data.data.settings.log2FCCutoff,
          id: volcanoPlotID,
          manualAxis: false,
          pCutOff: data.data.settings.pCutoff,
          plotTitle: "Volcano Plot",
          pointSize: 10,
          selectedMap: selectedMap,
          visible: {},
          volcanoAxis: {
            minX: 0, maxX: 0, minY: 0, maxY: 0
          }
        }
      })

      jsonData.plotLists.push({
        df: "",
        extraMetaDataDBID: "processed.txt",
        filename: "raw.txt",
        form: {
          primaryID: data.data.rawForm._primaryIDs,
          samples: data.data.rawForm._samples,
          comparisonCol: "",
          comparison: "",
        },
        id: barChartPlotID,
        plotType: "bar-chart",
        ptm: false,
        samples: samples,
        searchLinkTo: volcanoPlotID,
        settings: {
          plotTitle: "Bar Chart",
          colorMap: {},
          sampleVisibility: data.data.settings.sampleVisible,
          categories: data.data.selectionsName.slice(),
          selectedMap: selectedMap,
          barChartErrorType: "Standard Error",
          annotations: {}
        }
      })
    }
    return jsonData
  }
}
