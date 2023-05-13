import {Component, Input, OnDestroy} from '@angular/core';
import {UniprotService} from "../../services/uniprot.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-uniprot-segment-progress',
  templateUrl: './uniprot-segment-progress.component.html',
  styleUrls: ['./uniprot-segment-progress.component.less']
})
export class UniprotSegmentProgressComponent implements OnDestroy{
  private _segment: string = ""
  @Input() set segment(value: string) {
    this._segment = value
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe()
    }

    this.statusSubscription = this.uniprot.uniprotProgressSubjectMap.get(this._segment)?.subscribe((value) => {
      this.progressValue = value.progressValue
      this.progressText = value.progressText
    })
  }

  get segment(): string {
    return this._segment
  }

  statusSubscription: Subscription|undefined

  progressValue: number = 0
  progressText: string = ""

  constructor(public uniprot: UniprotService) {

  }

  ngOnDestroy(): void {
    this.statusSubscription?.unsubscribe()
  }
}
