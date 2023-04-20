import {Component, Input} from '@angular/core';
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-line-chart-form',
  templateUrl: './line-chart-form.component.html',
  styleUrls: ['./line-chart-form.component.less']
})
export class LineChartFormComponent {
  @Input() columns: string[] = []
  form = this.fb.group({
    primaryID: [''],
    xAxis: [''],
    yAxis: [''],
  })
  constructor(private fb: FormBuilder) { }
}
