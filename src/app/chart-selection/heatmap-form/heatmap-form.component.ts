import {Component, Input} from '@angular/core';
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-heatmap-form',
  templateUrl: './heatmap-form.component.html',
  styleUrls: ['./heatmap-form.component.less']
})
export class HeatmapFormComponent {
  @Input() columns: string[] = []

  form = this.fb.group({
    primaryID: [''],
    samples: [[]],
  })

  constructor(private fb: FormBuilder) { }
}
