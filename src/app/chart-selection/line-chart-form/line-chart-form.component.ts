import {Component, Input} from '@angular/core';
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-line-chart-form',
  templateUrl: './line-chart-form.component.html',
  styleUrls: ['./line-chart-form.component.less']
})
export class LineChartFormComponent {
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
  constructor(private fb: FormBuilder) { }
}
