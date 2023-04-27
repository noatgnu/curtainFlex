import { Injectable } from '@angular/core';
import {IDataFrame, Series} from "data-forge";
import {Subject} from "rxjs";
import {PlotData} from "../interface/plot-data";
import {InputFile} from "../classes/input-file";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  plotsSubject: Subject<any> = new Subject<any>()
  data: {files: Map<string, InputFile>, filenameList: string[]} = {files: new Map<string, InputFile>(), filenameList: []}
  plotLists: PlotData[] = []

  extraMetaData: Map<string, any> = new Map<string, any>()

  constructor() { }

  processForm(data: IDataFrame, form: any, plotType: string): {form: any, samples: {sample: string, replicate: string, column: string}[], data: IDataFrame, plotType: string} {
    let samples: {condition: string, replicate: string, column: string}[] = []
    let result: any = {}
    switch (plotType) {
      case 'volcano-plot':
        result = this.processVolcanoPlotForm(form, data, samples);
        break;
      case 'heatmap':
        result = this.processCorrelationMatrixForm(form, data, samples);
        break
      case 'scatter-plot':
        result = this.processScatterPlotForm(form, data, samples);
        break
      case 'bar-chart':
        result = this.processBarChartForm(form, data, samples);
        break
      case 'line-chart':
        result = this.processLineChartForm(form, data, samples);
        break
      case 'box-plot':
        result = this.processBoxPlotForm(form, data, samples);
        break
    }
    result["plotType"] = plotType
    return result
  }

  addPlotToList(plot: PlotData) {
    this.plotsSubject.next(plot)
    this.plotLists.push(plot)
  }



  private processVolcanoPlotForm(form: any, data: IDataFrame<number, any>, samples: {
    condition: string;
    replicate: string;
    column: string
  }[]) {
    if (form["foldChange"]) {
      data = data.withSeries(form["foldChange"], new Series(this.convertToNumber(data.getSeries(form["foldChange"]).toArray()))).bake()
    }
    if (form["performlog2Transform"] && form["foldChange"]) {
      data = data.withSeries(form["foldChange"], new Series(this.log2Convert(data.getSeries(form["foldChange"]).toArray()))).bake()
    }
    if (form["minuslog10pValue"]) {
      data = data.withSeries(form["minuslog10pValue"], new Series(this.convertToNumber(data.getSeries(form["minuslog10pValue"]).toArray()))).bake()
    }
    if (form["performMinuslog10Transform"] && form["minuslog10pValue"]) {
      data = data.withSeries(form["minuslog10pValue"], new Series(this.log10Convert(data.getSeries(form["minuslog10pValue"]).toArray()))).bake()
    }
    return {form: form, samples: samples, data: data}
  }

  private processCorrelationMatrixForm(form: any, data: IDataFrame<number, any>, samples: {
    condition: string;
    replicate: string;
    column: string
  }[]) {
    if (form["samples"]) {
      // Split the sample label into condition and replicate id by the last period
      // @ts-ignore
      samples = form["samples"].map((sample: string) => {
        const split = sample.split('.')
        if (split.length > 1) {
          return {condition: split.slice(0, split.length - 1).join("_") ,replicate: split[split.length - 1], column: sample}
        } else {
          return {condition: sample, replicate: '', column: sample}
        }
      })
      for (const sample of samples) {
        data = data.withSeries(sample.column, new Series(this.convertToNumber(data.getSeries(sample.column).toArray()))).bake()
      }
    }
    return {form: form, samples: samples, data: data}
  }

  convertToNumber(arr: string[]) {
    const newCol = arr.map(Number)
    return newCol
  }

  log2Convert(arr: number[]) {
    const newCol = arr.map(a => this.log2Stuff(a))
    return newCol
  }

  log2Stuff(data: number) {
    if (data > 0) {
      return Math.log2(data)
    } else if (data < 0) {
      return -Math.log2(Math.abs(data))
    } else {
      return 0
    }
  }

  log10Convert(arr: number[]) {
    const newCol = arr.map(a => -Math.log10(a))
    return newCol
  }

  private processScatterPlotForm(form: any, data: IDataFrame, samples: {condition: string; replicate: string; column: string}[]) {

    data = data.withSeries(form["xAxis"], new Series(this.convertToNumber(data.getSeries(form["xAxis"]).toArray()))).bake()
    data = data.withSeries(form["yAxis"], new Series(this.convertToNumber(data.getSeries(form["yAxis"]).toArray()))).bake()

    return {form: form, samples: samples, data: data}
  }

  private processBarChartForm(form: any, data: IDataFrame, samples: {condition: string; replicate: string; column: string}[]) {
    if (form["samples"]) {
      // Split the sample label into condition and replicate id by the last period
      // @ts-ignore
      samples = form["samples"].map((sample: string) => {
        const split = sample.split('.')
        console.log(split)
        if (split.length > 1) {
          return {condition: split.slice(0, split.length - 1).join("_") ,replicate: split[split.length - 1], column: sample}
        } else {
          return {condition: sample, replicate: '', column: sample}
        }
      })
    }
    for (const sample of samples) {
      data = data.withSeries(sample.column, new Series(this.convertToNumber(data.getSeries(sample.column).toArray()))).bake()
    }
    return {form: form, samples: samples, data: data}
  }

  private processLineChartForm(form: any, data: IDataFrame, samples: {condition: string; replicate: string; column: string}[]) {
    if (form["samples"]) {
      // Split the sample label into condition and replicate id by the last period
      // @ts-ignore
      samples = form["samples"].map((sample: string) => {
        const split = sample.split('.')
        if (split.length > 1) {
          return {condition: split.slice(0, split.length - 1).join("_") ,replicate: split[split.length - 1], column: sample}
        } else {
          return {condition: sample, replicate: '', column: sample}
        }
      })
    }
    for (const sample of samples) {
      data = data.withSeries(sample.column, new Series(this.convertToNumber(data.getSeries(sample.column).toArray()))).bake()
    }
    return {form: form, samples: samples, data: data}
  }

  private processBoxPlotForm(form: any, data: IDataFrame, samples: {condition: string; replicate: string; column: string}[]) {
    if (form["samples"]) {
      // Split the sample label into condition and replicate id by the last period
      // @ts-ignore
      samples = form["samples"].map((sample: string) => {
        const split = sample.split('.')
        if (split.length > 1) {
          return {condition: split.slice(0, split.length - 1).join("_") ,replicate: split[split.length - 1], column: sample}
        } else {
          return {condition: sample, replicate: '', column: sample}
        }
      })
    }
    for (const sample of samples) {
      data = data.withSeries(sample.column, new Series(this.convertToNumber(data.getSeries(sample.column).toArray()))).bake()
    }
    return {form: form, samples: samples, data: data};
  }

  palette = {
    "pastel": [
      "#fd7f6f",
      "#7eb0d5",
      "#b2e061",
      "#bd7ebe",
      "#ffb55a",
      "#ffee65",
      "#beb9db",
      "#fdcce5",
      "#8bd3c7"
    ], "retro":[
      "#ea5545",
      "#f46a9b",
      "#ef9b20",
      "#edbf33",
      "#ede15b",
      "#bdcf32",
      "#87bc45",
      "#27aeef",
      "#b33dc6"
    ]
  }

  minMax = {
    fcMin: 0,
    fcMax: 0,
    pMin: 0,
    pMax: 0
  }

  significantGroup(x: number, y: number, pCutoff: number = 0.05, log2FCCutoff: number = 0.6) {
    const ylog = -Math.log10(pCutoff)
    const groups: string[] = []
    if (ylog > y) {
      groups.push("P-value < " + pCutoff)
    } else {
      groups.push("P-value >= " + pCutoff)
    }

    if (Math.abs(x) > log2FCCutoff) {
      groups.push("FC > " + log2FCCutoff)
    } else {
      groups.push("FC <= " + log2FCCutoff)
    }

    return groups.join(";")
  }

  defaultVolcanoPlotOptions: any = {
    id: "",
    plotTitle: "Volcano Plot",
    colorMap: {},
    categories: [],
    volcanoAxis: {minX: 0, maxX: 0, minY: 0, maxY: 0},
    backgroundColorGrey: false,
    selectedMap: {},
    pCutOff: 0.05,
    fcCutOff: 0.6,
  }

  defaultBarChartOptions: any = {
    plotTitle: "Bar Chart",
    colorMap: {},
    sampleVisibility: {},
    categories: [],
    selectedMap: {},
  }

  getDefaultsPlotOptions(plotType: string) {
    let settings: any = {}
    switch (plotType) {
      case "volcano-plot":
        settings = this.defaultVolcanoPlotOptions
        break
      case "bar-chart":
        settings = this.defaultBarChartOptions
        break
    }
    settings["id"] = crypto.randomUUID()
    return settings
  }

  saveSession() {

  }

  movePlotUp(plotId: string) {
    for (let index = 0; index < this.plotLists.length; index++) {
      if (this.plotLists[index].settings.id === plotId) {
        this.moveElementInArray(this.plotLists, index, index - 1)
        break
      }
    }
  }

  movePlotDown(plotId: string) {
    for (let index = 0; index < this.plotLists.length; index++) {
      if (this.plotLists[index].settings.id === plotId) {
        this.moveElementInArray(this.plotLists, index, index + 1)
        break
      }
    }
  }

  moveElementInArray(array: any[], from: number, to: number) {
    array.splice(to, 0, array.splice(from, 1)[0]);
  }

  removePlot(plotId: string) {
    for (let index = 0; index < this.plotLists.length; index++) {
      if (this.plotLists[index].settings.id === plotId) {
        this.plotLists.splice(index, 1)
        break
      }
    }
  }

  getExtraMetaData(primaryID: string, extraMetaDataDBID: string) {
    const df = this.data.files.get(extraMetaDataDBID)
    const meta = this.extraMetaData.get(extraMetaDataDBID)
    if (df && meta) {
      const data = meta.primaryIDMap.get(primaryID)
      if (data) {
        return this.getExtraMetaDataFromColumn(data, meta)
      }
    }
    return null
  }

  getExtraMetaDataFromColumn(id: string, extraMetaDataDB: any) {
    const a = extraMetaDataDB.accMap.get(id)
    if (a) {
      const res = a.filter((val: any) => {
        return !!extraMetaDataDB.dataMap.has(val);
      })
      if (res.length >0) {
        const metaRow = extraMetaDataDB.db.get(res[0])
        if (metaRow) {
          return metaRow
        }
      }
    }
    return null
  }
}
