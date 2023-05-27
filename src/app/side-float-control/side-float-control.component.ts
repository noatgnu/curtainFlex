import {Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {DataService} from "../services/data.service";
import {ScrollService} from "../services/scroll.service";
import {PlotData} from "../interface/plot-data";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AboutUsModalComponent} from "../modal/about-us-modal/about-us-modal.component";

@Component({
  selector: 'app-side-float-control',
  templateUrl: './side-float-control.component.html',
  styleUrls: ['./side-float-control.component.less'],
  animations: [
    trigger('cogTimeLoopStart', [
      state('start', style({
        bottom: "0px",
        left: "50px",
      })),
      state('end', style({
        bottom: "20px",
        left: "50px",
      })),
      transition(
        'start => end',
        animate('1s ease-in-out'),
      ),
    ]),
  ]
})
export class SideFloatControlComponent {
  @ViewChild("animatedCog") animatedCog: ElementRef|undefined
  @ViewChild("animatedCog2") animatedCog2: ElementRef|undefined
  cogAnimationLoop: boolean = true

  currentPlot: PlotData|undefined
  constructor(public dataService: DataService, private scrollService: ScrollService, private modal: NgbModal) {
    this.scrollService.currentPlotSubject.asObservable().subscribe(
      (id: string) => {
        if (id && id !== "") {
          this.currentPlot = this.dataService.plotLists.find(plot => plot.id === id)
        }
      }
    )
    setTimeout(() => {
      this.cogAnimationLoop = false
    }, 2000)

    this.currentPlot = this.dataService.plotLists[0]
  }

  scrollToTop() {
    this.scrollService.scrollToID(this.dataService.plotLists[0].id)
  }

  scrollToBottom() {
    this.scrollService.scrollToID(this.dataService.plotLists[this.dataService.plotLists.length - 1].id)
  }

  scrollToNext() {
    if (this.currentPlot) {
      const index = this.dataService.plotLists.indexOf(this.currentPlot)
      if (index >= 0 && index < this.dataService.plotLists.length - 1) {
        this.scrollService.scrollToID(this.dataService.plotLists[index + 1].id)
      }
    }
  }

  scrollToPrevious() {
    if (this.currentPlot) {
      const index = this.dataService.plotLists.indexOf(this.currentPlot)
      if (index > 0 && index < this.dataService.plotLists.length) {
        this.scrollService.scrollToID(this.dataService.plotLists[index - 1].id)
      }
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    // rotate the asterisk when scrolling
    if (this.animatedCog) {
      this.animatedCog.nativeElement.style.transform = `rotate(${window.scrollY / 10}deg)`
    }
  }

  openAboutUs(){
    this.modal.open(AboutUsModalComponent, {size: "xl"})
  }
}
