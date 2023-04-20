import {Component, Input} from '@angular/core';
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-scatter-plot-form',
  templateUrl: './scatter-plot-form.component.html',
  styleUrls: ['./scatter-plot-form.component.less']
})
export class ScatterPlotFormComponent {
  @Input() columns: string[] = []
  form = this.fb.group({
    primaryID: [''],
    xAxis: [''],
    yAxis: [''],
  })
  constructor(private fb: FormBuilder) { }
}
