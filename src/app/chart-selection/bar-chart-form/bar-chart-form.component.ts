import {Component, Input} from '@angular/core';
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-bar-chart-form',
  templateUrl: './bar-chart-form.component.html',
  styleUrls: ['./bar-chart-form.component.less']
})
export class BarChartFormComponent {
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
