import { Component, OnInit } from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ChartSelectionComponent} from "./chart-selection/chart-selection.component";
import {InputFile} from "./classes/input-file";
import {fromCSV} from "data-forge";
import {DataService} from "./services/data.service";

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
      const defaultSettings = this.dataService.getDefaultsPlotOptions(result.plotType)
      const plotSettings:any = {df: results.data, form: result.form, settings: defaultSettings, plotType: result.plotType}
      this.dataService.addPlotToList(plotSettings)
    })
  }
}
