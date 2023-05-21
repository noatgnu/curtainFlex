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
    const modalRef = this.modal.open(ChartSelectionComponent);
    modalRef.componentInstance.data = this.dataService.data
    modalRef.componentInstance.plotList = this.dataService.plotLists
    modalRef.closed.subscribe((result) => {
      const results = this.dataService.processForm(result.plotTitle, result.data.df, result.form, result.plotType)
      const defaultSettings: any = this.dataService.getDefaultsPlotOptions(result.plotType)
      if ("sampleVisibility" in defaultSettings) {
        for (const sample of results.samples) {
          defaultSettings.sampleVisibility[sample.column] = true
        }
      }

      const plotSettings: PlotData = {id: result.plotTitle, filename: result.filename, df: results.data, form: result.form, settings: defaultSettings, plotType: result.plotType, samples: results.samples, extraMetaDataDBID: result.data.extraMetaDataDBID, searchLinkTo: result.searchLinkTo, ptm: result.ptm}
      if (result.searchLinkTo === "") {
        plotSettings.searchLinkTo = result.plotTitle
      }
      this.dataService.searchSubject.set(plotSettings.id, new Subject<any>())
      this.dataService.addPlotToList(plotSettings)
    })
  }

  openSelectExtraMetadataModal(fileName: string) {
    const df = this.dataService.data.files.get(fileName)
    if (df) {
      const select = this.modal.open(SelectExtraMetadataModalComponent)
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
