import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-plot-container',
  templateUrl: './plot-container.component.html',
  styleUrls: ['./plot-container.component.less']
})
export class PlotContainerComponent {
  _data: any = {}
  @Input() set data(value: any) {
    this._data = value
  }

  get data() {
    console.log(this._data)
    return this._data
  }
}
