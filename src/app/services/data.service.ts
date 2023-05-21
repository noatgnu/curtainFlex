import { Injectable } from '@angular/core';
import {DataFrame, fromCSV, IDataFrame, Series} from "data-forge";
import {Subject} from "rxjs";
import {PlotData} from "../interface/plot-data";
import {InputFile} from "../classes/input-file";
import {replacer} from "curtain-web-api";
import {
  SelectExtraMetadataModalComponent
} from "../modal/select-extra-metadata-modal/select-extra-metadata-modal.component";
import {UniprotService} from "./uniprot.service";
import {addWarning} from "@angular-devkit/build-angular/src/utils/webpack-diagnostics";
import {AccountsService} from "./accounts.service";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  plotsSubject: Subject<any> = new Subject<any>()
  data: {files: Map<string, InputFile>, filenameList: string[]} = {files: new Map<string, InputFile>(), filenameList: []}
  plotLists: PlotData[] = []
  ptmMetaData: Map<string, any> = new Map<string, any>()
  extraMetaData: Map<string, any> = new Map<string, any>()
  searchSubject: Map<string, Subject<any>> = new Map<string, Subject<any>>()
  showUniprotProgress: boolean = false
  differentialMap: Map<string, {increase: {[key: string]: {fc: number, p: number}}, decrease: {[key: string]: {fc: number, p: number}}, notSignificant: {[key: string]: {fc: number, p: number}}}> = new Map<string, any>()
  plotUpdateSubjectMap: Map<string, Subject<any>> = new Map<string, Subject<any>>()

  currentSession: any = {
    id: "",
    data: {},
    link: "",
    loading: false,
    loadingProgress: 0,
    loadingProgressMessage: "",
  }
  constructor(private uniprot: UniprotService, private accountsService: AccountsService) {
    this.uniprot.progressSubject.asObservable().subscribe(data => {
      this.currentSession.loadingProgress = data.progressValue
      this.currentSession.loadingProgressMessage = data.progressText
    })
  }

  processForm(id: string, data: IDataFrame, form: any, plotType: string): {form: any, samples: {sample: string, replicate: string, column: string}[], data: IDataFrame, plotType: string} {
    let samples: {condition: string, replicate: string, column: string}[] = []
    let result: any = {}
    switch (plotType) {
      case 'volcano-plot':
        result = this.processVolcanoPlotForm(id, form, data, samples);
        break;
      case 'heatmap':
        result = this.processCorrelationMatrixForm(id, form, data, samples);
        break
      case 'scatter-plot':
        result = this.processScatterPlotForm(id, form, data, samples);
        break
      case 'bar-chart':
        result = this.processBarChartForm(id, form, data, samples);
        break
      case 'ptm-bar-chart':
        result = this.processBarChartForm(id, form, data, samples);
        break
      case 'line-chart':
        result = this.processLineChartForm(id, form, data, samples);
        break
      case 'box-plot':
        result = this.processBoxPlotForm(id, form, data, samples);
        break
    }
    result["plotType"] = plotType
    return result
  }

  addPlotToList(plot: PlotData) {
    this.plotsSubject.next(plot)
    this.plotLists.push(plot)
  }



  private processVolcanoPlotForm(id: string, form: any, data: IDataFrame<number, any>, samples: {
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

  private processCorrelationMatrixForm(id: string, form: any, data: IDataFrame<number, any>, samples: {
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

  private processScatterPlotForm(id: string, form: any, data: IDataFrame, samples: {condition: string; replicate: string; column: string}[]) {

    data = data.withSeries(form["xAxis"], new Series(this.convertToNumber(data.getSeries(form["xAxis"]).toArray()))).bake()
    data = data.withSeries(form["yAxis"], new Series(this.convertToNumber(data.getSeries(form["yAxis"]).toArray()))).bake()

    return {form: form, samples: samples, data: data}
  }

  private processBarChartForm(id: string, form: any, data: IDataFrame, samples: {condition: string; replicate: string; column: string}[]) {
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

  private processLineChartForm(id: string, form: any, data: IDataFrame, samples: {condition: string; replicate: string; column: string}[]) {
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

  private processBoxPlotForm(id: string, form: any, data: IDataFrame, samples: {condition: string; replicate: string; column: string}[]) {
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
    visible: {},
    annotations: {}
  }

  defaultBarChartOptions: any = {
    plotTitle: "Bar Chart",
    colorMap: {},
    sampleVisibility: {},
    categories: [],
    selectedMap: {},
    barChartErrorType: "Standard Error",
    annotations: {}
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
      case "ptm-bar-chart":
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
        return this.getExtraMetaDataFromColumn(data[0], meta)
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

  exportData() {
    const tobeExported = this.getDataPack();

    const data = JSON.stringify(tobeExported, (key, value) => {
      if (key === "df" && value instanceof DataFrame) {
        return ""
      }
      return value
    })
    const blob = new Blob([data], {type: 'text/plain'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url
    a.download = "export.json"
    document.body.appendChild(a)
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url)
  }

  getDataPack() {
    const files: any = {}
    this.data.files.forEach((df, key) => {
      files[key] = {}
      files[key]["filename"] = df.filename
      files[key]["originalFile"] = df.originalFile
      files[key]["other"] = df.other
      files[key]["extraMetaDataDBID"] = df.extraMetaDataDBID
      files[key]["df"] = ""
    })
    const extraMetaData: any = {}

    this.extraMetaData.forEach((value, key) => {
      if (value["form"]) {
        extraMetaData[key] = {"form": value["form"]}
      }
      if (value["ptmForm"]) {
        extraMetaData[key]["ptmForm"] = value["ptmForm"]
      }
    })
    const tobeExported: any = {
      data: {files: files, filenameList: this.data.filenameList},
      plotLists: this.plotLists.map((plot) => {
        return {
          df: "",
          extraMetaDataDBID: plot.extraMetaDataDBID,
          filename: plot.filename,
          form: plot.form,
          id: plot.id,
          plotType: plot.plotType,
          samples: plot.samples,
          searchLinkTo: plot.searchLinkTo,
          settings: plot.settings,
          ptm: plot.ptm,
        }
      }),
      extraMetaData: extraMetaData,
    }
    return tobeExported;
  }

  loadSessionFromFile(file: File) {
    const reader = new FileReader()
    reader.onprogress = (event) => {
      console.log(event.loaded, event.total)
    }
    reader.onload = (event) => {
      console.log(event.loaded)
      const result = reader.result
      this.processFile(result).then(() =>{console.log("done")});
    }
    reader.readAsText(file)
  }

  private async processFile(result: string | ArrayBuffer | null) {
    if (result) {
      const jsonData = JSON.parse(result as string)
      await this.processJSON(jsonData);
    }
  }

  async processJSON(jsonData: any) {
    this.currentSession.loading = true
    this.currentSession.loadingProgress = 100
    this.currentSession.loadingProgressMessage = "Loading data..."
    this.plotLists = []
    this.data = {files: new Map<string, InputFile>(), filenameList: jsonData.data.filenameList}
    console.log(jsonData)
    for (const key in jsonData.data.files) {
      const inputFile = new InputFile(fromCSV(jsonData.data.files[key]["originalFile"]), jsonData.data.files[key].filename, jsonData.data.files[key]["originalFile"])
      this.data.files.set(key, inputFile)
      if (jsonData.extraMetaData[key]) {
        this.currentSession.loadingProgressMessage = `Processing ${jsonData.data.files[key].filename}...`
        if (!jsonData.extraMetaData[key]["form"]["enableLink"]) {
          const {
            accMap,
            primaryIDMap,
            accs
          } = SelectExtraMetadataModalComponent.getAccs(jsonData.extraMetaData[key]["form"], inputFile.df)
          if (accs.length > 0) {
            let meta: any = {}
            switch (jsonData.extraMetaData[key]["form"]["source"]) {
              case "uniprot":
                this.currentSession.loadingProgressMessage = `Getting extra metadata from UniProt for ${key}...`
                this.showUniprotProgress = true
                const uniResult = await this.uniprot.getUniprot(accs, accMap)
                meta = {
                  db: uniResult.db,
                  dataMap: uniResult.dataMap,
                  form: jsonData.extraMetaData[key]["form"],
                  ptmForm: jsonData.extraMetaData[key]["ptmForm"],
                  accMap: accMap,
                  primaryIDMap: primaryIDMap,
                  geneList: uniResult.geneList
                }
                this.showUniprotProgress = false
                break
            }
            if (Object.keys(meta).length > 0) {
              if (meta.form.enableLink) {
                if (meta.form.linkTo) {
                  const df2 = this.data.files.get(meta.form.linkTo)
                  if (df2) {
                    inputFile.extraMetaDataDBID = df2.extraMetaDataDBID
                  }
                }
              } else {
                inputFile.extraMetaDataDBID = key
                this.extraMetaData.set(inputFile.extraMetaDataDBID, meta)
              }
            }
          }
        } else {
          inputFile.extraMetaDataDBID = jsonData.extraMetaData[key]["form"].linkTo
          this.extraMetaData.set(inputFile.filename, {form: jsonData.extraMetaData[key]["form"], ptmForm: jsonData.extraMetaData[key]["ptmForm"]})
        }
      }
    }
    console.log(this.data)
    for (const plot of jsonData.plotLists) {
      this.currentSession.loadingProgressMessage = `Processing plot ${plot.id}...`
      const p: PlotData = {
        settings: plot.settings,
        id: plot.id,
        filename: plot.filename,
        df: fromCSV(jsonData.data.files[plot.filename]["originalFile"]),
        form: plot.form,
        samples: plot.samples,
        plotType: plot.plotType,
        searchLinkTo: plot.searchLinkTo,
        extraMetaDataDBID: plot.extraMetaDataDBID,
        ptm: plot.ptm,
      }
      const processed = this.processForm(p.id, p.df, p.form, p.plotType)
      p.df = processed.data
      this.searchSubject.set(p.id, new Subject<any>())
      this.addPlotToList(p)

    }
    this.currentSession.loadingProgressMessage = "Finished"
  }

  saveSessionToWeb() {
    const tobeExported = this.getDataPack();

    this.accountsService.curtainAPI.putSettings(tobeExported, !this.accountsService.curtainAPI.user.loginStatus, "").then((res) => {
      if (res.data) {
        this.currentSession.id = res.data.link_id
        this.currentSession.data = res.data
        this.currentSession.link = location.origin + "/#/" + this.currentSession.id
      }
    }).catch((err) => {
      console.log(err)
    })
  }

}
