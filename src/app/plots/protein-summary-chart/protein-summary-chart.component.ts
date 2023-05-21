import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DataFrame, IDataFrame, ISeries, Series} from "data-forge";
import {DataService} from "../../services/data.service";
import {PlotDataGeneric} from "../../interface/plot-data";
import {PdbViewerModalComponent} from "../../modal/pdb-viewer-modal/pdb-viewer-modal.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {UniprotService} from "../../services/uniprot.service";
import {ProteinDomainModalComponent} from "../../modal/protein-domain-modal/protein-domain-modal.component";
import {FormBuilder} from "@angular/forms";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-bar-chart',
  templateUrl: './protein-summary-chart.component.html',
  styleUrls: ['./protein-summary-chart.component.less']
})
export class ProteinSummaryChartComponent {
  private _data: any = {}
  extraMetaDataDBID: string = ""
  primaryID: string = ""

  hasExtra: boolean = false


  metaData: any = {}
  relatedVolcano: any = {}
  @Input() set data(value: PlotDataGeneric) {

    this.primaryID = value.df[value.form.primaryID]
    if (value.extraMetaDataDBID) {
      this.extraMetaDataDBID = value.extraMetaDataDBID
      const data = this.dataService.getExtraMetaData(this.primaryID, this.extraMetaDataDBID)
      if (data) {
        this.metaData = data
        this.hasExtra = true
      }
    }
    this._data = value
    if (this.data.settings.annotations) {
      this.form = this.fb.group({
        toggleAnnotation: [this.data.settings.annotations[this.primaryID],],
      })
      if (this.subscription) {
        this.subscription.unsubscribe()
      }
      this.subscription = this.form.controls.toggleAnnotation.valueChanges.subscribe((value) => {
        if (value !== null) {
          this.toggleAnnotation.emit(value)
        }
      })
    }
  }


  @Output() toggleAnnotation: EventEmitter<boolean> = new EventEmitter<boolean>()
  get data(): PlotDataGeneric {
    return this._data
  }

  form = this.fb.group({
    toggleAnnotation: [false,],
  })

  subscription: Subscription|undefined

  constructor(private dataService: DataService, private fb: FormBuilder) {
    this.form.controls.toggleAnnotation.valueChanges.subscribe((value) => {
      if (value !== null) {
        this.toggleAnnotation.emit(value)
      }
    })
  }



}
