import {Component, Input} from '@angular/core';
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-box-plot-form',
  templateUrl: './box-plot-form.component.html',
  styleUrls: ['./box-plot-form.component.less']
})
export class BoxPlotFormComponent {
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
