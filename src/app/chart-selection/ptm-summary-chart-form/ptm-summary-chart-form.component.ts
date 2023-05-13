import {Component, Input} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {DataService} from "../../services/data.service";

@Component({
  selector: 'app-ptm-summary-chart-form',
  templateUrl: './ptm-summary-chart-form.component.html',
  styleUrls: ['./ptm-summary-chart-form.component.less']
})
export class PtmSummaryChartFormComponent {
  private _columns: string[] = []
  @Input() set columns(value: string[]) {
    this._columns = value
  }

  get columns(): string[] {
    return this._columns
  }
  form = this.fb.group({
    primaryID: [''],
    samples: [[]],
  })

  constructor(private fb: FormBuilder, public dataService: DataService) {

  }
}
