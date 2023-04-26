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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit{
  title = 'Curtain Flex';
  settings: any = {files: {}}
  data: {files: Map<string, InputFile>, filenameList: string[]} = {files: new Map<string, InputFile>(), filenameList: []}


  constructor(private modal: NgbModal, private dataService: DataService) { }

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
            this.data.files.set(target.files[0].name, new InputFile(fromCSV(<string>loadedFile), target.files[0].name, <string>loadedFile))
            this.data.filenameList.push(target.files[0].name)
            if (this.data.files.has(target.files[0].name)) {
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
    modalRef.componentInstance.data = this.data
    modalRef.closed.subscribe((result) => {
      const results = this.dataService.processForm(result.data, result.form, result.plotType)
      const defaultSettings: any = this.dataService.getDefaultsPlotOptions(result.plotType)
      if ("sampleVisibility" in defaultSettings) {
        for (const sample of results.samples) {
          defaultSettings.sampleVisibility[sample.column] = true
        }
      }

      const plotSettings: PlotData = {df: results.data, form: result.form, settings: defaultSettings, plotType: result.plotType, samples: results.samples}

      this.dataService.addPlotToList(plotSettings)
    })
  }

  openSelectExtraMetadataModal(fileName: string) {
    const df = this.data.files.get(fileName)
    if (df) {
      const select = this.modal.open(SelectExtraMetadataModalComponent)
      select.componentInstance.data = df.df
      select.componentInstance.filenameList = this.data.filenameList.filter((value) => {
        return !!(this.data.files.get(value)?.extraMetaDataDBID && this.data.files.get(value)?.extraMetaDataDBID !== "" && value !== fileName);
      })
      select.closed.subscribe((result) => {
        if (result) {
          if (result.form.enableLink) {
            if (result.form.linkTo) {
              const df2 = this.data.files.get(result.form.linkTo)
              if (df2) {
                df.extraMetaDataDBID = df2.extraMetaDataDBID
              }
            }
          } else {
            df.extraMetaDataDBID = crypto.randomUUID()

            this.dataService.extraMetaData.set(df.extraMetaDataDBID, result)
          }
        }
      })
    }

  }
}
