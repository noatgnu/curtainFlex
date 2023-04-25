import {Component, Input} from '@angular/core';
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-correlation-matrix-form',
  templateUrl: './correlation-matrix-form.component.html',
  styleUrls: ['./correlation-matrix-form.component.less']
})
export class CorrelationMatrixFormComponent {
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
