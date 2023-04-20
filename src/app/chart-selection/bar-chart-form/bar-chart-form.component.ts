import {Component, Input} from '@angular/core';
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-bar-chart-form',
  templateUrl: './bar-chart-form.component.html',
  styleUrls: ['./bar-chart-form.component.less']
})
export class BarChartFormComponent {
  @Input() columns: string[] = []

  form = this.fb.group({
    primaryID: [''],
    xAxis: [[]],
    xAxisIsSamples: [true],
    yAxis: [''],
  })

  constructor(private fb: FormBuilder) { }
}
