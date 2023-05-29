import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {Observable, ObservableInput, Subscription} from "rxjs";
import {DataService} from "../../services/data.service";

@Component({
  selector: 'app-volcano-plot-form',
  templateUrl: './volcano-plot-form.component.html',
  styleUrls: ['./volcano-plot-form.component.less']
})
export class VolcanoPlotFormComponent {
  private _columns: string[] = []
  @Input() set columns(value: string[]) {
    this._columns = value
  }

  get columns(): string[] {
    return this._columns
  }

  form = this.fb.group({
    primaryID: [''],
    foldChange: [''],
    performlog2Transform: [false],
    minuslog10pValue: [''],
    performMinuslog10Transform: [false],
  })
  constructor(private fb: FormBuilder) {
  }
}
