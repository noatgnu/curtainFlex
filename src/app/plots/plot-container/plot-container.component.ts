import {Component, Input} from '@angular/core';
import {PlotData} from "../../interface/plot-data";
import {DataFrame} from "data-forge";
import {DataService} from "../../services/data.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {BatchSearchModalComponent} from "../../modal/batch-search-modal/batch-search-modal.component";

@Component({
  selector: 'app-plot-container',
  templateUrl: './plot-container.component.html',
  styleUrls: ['./plot-container.component.less']
})
export class PlotContainerComponent {
  _data: PlotData = {
    df: new DataFrame(),
    form: null,
    settings: null,
    samples: [],
    plotType: ""
  }

  formChangeStatus: boolean = false

  @Input() position: number = 0

  @Input() set data(value: PlotData) {
    if (value !== this._data) {
      this._data = value
    }
  }

  get data() {
    return this._data
  }

  constructor(public dataService: DataService, private modal: NgbModal) {

  }

  updateFormChangeStatus(status: boolean) {
    this.formChangeStatus = status
  }

  openBatchSearchModal() {
    const ref = this.modal.open(BatchSearchModalComponent, {size: 'lg'})
    ref.closed.subscribe((data: any) => {
      if (data) {
      }
    })
  }
}
