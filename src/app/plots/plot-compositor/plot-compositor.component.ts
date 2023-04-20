import { Component } from '@angular/core';
import {DataService} from "../../services/data.service";

@Component({
  selector: 'app-plot-compositor',
  templateUrl: './plot-compositor.component.html',
  styleUrls: ['./plot-compositor.component.less']
})
export class PlotCompositorComponent {
  constructor(public dataService: DataService) {

  }
}
