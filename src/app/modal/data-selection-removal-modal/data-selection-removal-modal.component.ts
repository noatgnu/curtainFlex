import {Component, Input} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {DataService} from "../../services/data.service";
import {PlotData} from "../../interface/plot-data";

@Component({
  selector: 'app-data-selection-removal-modal',
  templateUrl: './data-selection-removal-modal.component.html',
  styleUrls: ['./data-selection-removal-modal.component.less']
})
export class DataSelectionRemovalModalComponent {
  private _data: string = ""

  linkedPlots: PlotData[] = []
  mainPlot: PlotData|undefined
  @Input() set data(value: string) {
    this._data = value
    if (this.data !== "") {
      this.linkedPlots = this.dataService.plotLists.filter((p: PlotData) => p.searchLinkTo === this.data)
      this.mainPlot = this.linkedPlots.find((p: PlotData) => p.id === this.data)
    }
  }

  get data(): string {
    return this._data
  }

  constructor(private modal: NgbActiveModal, private dataService: DataService) {

  }

}
