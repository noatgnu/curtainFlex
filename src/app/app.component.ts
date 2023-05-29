import { Component, OnInit } from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ChartSelectionComponent} from "./chart-selection/chart-selection.component";
import {InputFile} from "./classes/input-file";
import {fromCSV, IDataFrame} from "data-forge";
import {DataService} from "./services/data.service";
import {PlotData} from "./interface/plot-data";
import {
  SelectExtraMetadataModalComponent
} from "./modal/select-extra-metadata-modal/select-extra-metadata-modal.component";
import {UniprotService} from "./services/uniprot.service";
import {Subject} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {
  ImportedDataManagementModalComponent
} from "./modal/imported-data-management-modal/imported-data-management-modal.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit{
  title = 'Curtain Flex';
  settings: any = {files: {}}


  constructor(private modal: NgbModal, public dataService: DataService, private route: ActivatedRoute, public uniprot: UniprotService) {
    this.route.params.subscribe(params => {
      console.log(params)
    })
  }

  ngOnInit(): void {

  }
  handleFile(e: Event) {
    if (e.target) {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const loadedFile = reader.result;
          if (target.files) {
            this.dataService.data.files.set(target.files[0].name, new InputFile(fromCSV(<string>loadedFile), target.files[0].name, <string>loadedFile))
            this.dataService.data.filenameList.push(target.files[0].name)
            if (this.dataService.data.files.has(target.files[0].name)) {
              this.openSelectExtraMetadataModal(target.files[0].name)
            }
          }

        }
        reader.readAsText(target.files[0]);
      }
    }
  }

  openChartSelection() {
    const modalRef = this.modal.open(ChartSelectionComponent, {scrollable: true});
    modalRef.componentInstance.data = this.dataService.data
    modalRef.componentInstance.plotList = this.dataService.plotLists
    modalRef.closed.subscribe((result) => {
      let df = result.data.df
      const results = this.dataService.processForm(result.plotTitle, df, result.form, result.plotType)
      results.form.comparisonCol = result.comparisonCol
      results.form.comparison = result.comparison
      const defaultSettings: any = this.dataService.getDefaultsPlotOptions(result.plotType)
      if ("sampleVisibility" in defaultSettings) {
        for (const sample of results.samples) {
          defaultSettings.sampleVisibility[sample.column] = true
        }
      }
      const plotSettings: PlotData = {
        id: result.plotTitle,
        filename: result.filename,
        df: results.data,
        form: result.form,
        settings: defaultSettings,
        plotType: result.plotType,
        samples: results.samples,
        extraMetaDataDBID: result.data.extraMetaDataDBID,
        searchLinkTo: result.searchLinkTo,
        ptm: result.ptm
      }
      if (result.searchLinkTo === "") {
        plotSettings.searchLinkTo = result.plotTitle
      } else {
        const linkedToPlot = this.dataService.plotLists.find((plot) => plot.id === result.searchLinkTo)

        if (linkedToPlot) {
          const data = plotSettings.df.getSeries(plotSettings.form.primaryID)
          const dataHas = data.where((value) => value in linkedToPlot.settings.selectedMap).bake()
          plotSettings.settings.selectedMap = {}
          plotSettings.settings.categories = []
          for (const id of dataHas.toArray()) {
            plotSettings.settings.selectedMap[id] = [...linkedToPlot.settings.selectedMap[id]]
            plotSettings.settings.selectedMap[id].forEach((category: string) => {
              if (!plotSettings.settings.categories.includes(category)) {
                plotSettings.settings.categories.push(category)
              }
            })
          }
          if (plotSettings.plotType === "volcano-plot" && plotSettings.plotType === linkedToPlot.plotType) {


            plotSettings.settings.colorMap = {}
            for (const id of plotSettings.settings.categories) {
              plotSettings.settings.colorMap[id] = linkedToPlot.settings.colorMap[id]
            }

            plotSettings.settings.volcanoAxis = {...linkedToPlot.settings.volcanoAxis}
            plotSettings.settings.backgroundColorGrey = linkedToPlot.settings.backgroundColorGrey

            plotSettings.settings.pCutOff = linkedToPlot.settings.pCutOff
            plotSettings.settings.fcCutOff = linkedToPlot.settings.fcCutOff
            plotSettings.settings.visible = {}
            for (const id of plotSettings.settings.categories) {
              plotSettings.settings.visible[id] = linkedToPlot.settings.visible[id]
            }
            plotSettings.settings.annotations = {}
            for (const id in linkedToPlot.settings.annotations) {
              plotSettings.settings.annotations[id] = linkedToPlot.settings.annotations[id]
            }
          }
        }
      }
      console.log(plotSettings)
      this.dataService.searchSubject.set(plotSettings.id, new Subject<any>())
      this.dataService.addPlotToList(plotSettings)
    })
  }

  openSelectExtraMetadataModal(fileName: string) {
    const df = this.dataService.data.files.get(fileName)
    if (df) {
      const select = this.modal.open(SelectExtraMetadataModalComponent, {backdrop: "static"})
      select.componentInstance.data = df.df
      select.componentInstance.filenameList = this.dataService.data.filenameList.filter((value) => {
        return !!(this.dataService.data.files.get(value)?.extraMetaDataDBID && this.dataService.data.files.get(value)?.extraMetaDataDBID !== "" && value !== fileName);
      })
      select.closed.subscribe((result) => {
        if (result) {
          if (result.form.enableLink) {
            if (result.form.linkTo) {
              const df2 = this.dataService.data.files.get(result.form.linkTo)
              if (df2) {
                df.extraMetaDataDBID = df2.extraMetaDataDBID
              }
            }
          } else {
            df.extraMetaDataDBID = fileName
          }
          this.dataService.extraMetaData.set(fileName, result)
        }
      })
    }
  }

  exportToFile() {
    this.dataService.exportData()
  }

  handleSessionFile(e: Event) {
    if (e.target) {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        this.dataService.loadSessionFromFile(target.files[0])
      }
    }
  }

  saveToWeb() {
    this.dataService.saveSessionToWeb()
  }

  openImportedDataManagementModal() {
    const ref = this.modal.open(ImportedDataManagementModalComponent, {size: "xl"})
    const data: any = {...this.dataService.data}
    data["extraMetaData"] = this.dataService.extraMetaData
    data["plotLists"] = this.dataService.plotLists
    ref.componentInstance.data = data
    ref.closed.subscribe((result) => {
      this.dataService.data.files = result.files
      this.dataService.data.filenameList = result.filenameList
      this.dataService.extraMetaData = result.extraMetaData
      this.dataService.plotLists = result.plotLists
    })
  }
}
