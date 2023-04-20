import {Component, Input} from '@angular/core';
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-box-plot-form',
  templateUrl: './box-plot-form.component.html',
  styleUrls: ['./box-plot-form.component.less']
})
export class BoxPlotFormComponent {
  @Input() columns: string[] = []

  form = this.fb.group({
    primaryID: [''],
    xAxis: [[]],
    xAxisIsSamples: [true],
    yAxis: [''],
  })

  constructor(private fb: FormBuilder) { }
}
