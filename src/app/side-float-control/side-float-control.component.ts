import { Component } from '@angular/core';
import {DataService} from "../services/data.service";
import {ScrollService} from "../services/scroll.service";
import {PlotData} from "../interface/plot-data";

@Component({
  selector: 'app-side-float-control',
  templateUrl: './side-float-control.component.html',
  styleUrls: ['./side-float-control.component.less']
})
export class SideFloatControlComponent {
  currentPlot: PlotData|undefined
  constructor(public dataService: DataService, private scrollService: ScrollService) {
    this.scrollService.currentPlotSubject.asObservable().subscribe(
      (id: string) => {
        if (id && id !== "") {
          this.currentPlot = this.dataService.plotLists.find(plot => plot.id === id)
        }
      }
    )
    this.currentPlot = this.dataService.plotLists[0]
  }

  scrollToTop() {
    this.scrollService.scrollToID(this.dataService.plotLists[0].id)
  }

  scrollToBottom() {
    this.scrollService.scrollToID(this.dataService.plotLists[this.dataService.plotLists.length - 1].id)
  }
}
