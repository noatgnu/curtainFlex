import {Component, Input} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {DataFrame} from "data-forge";
import {PlotData} from "../../interface/plot-data";
import {FormBuilder, FormGroup} from "@angular/forms";
import {DataService} from "../../services/data.service";

@Component({
  selector: 'app-plot-settings-modal',
  templateUrl: './plot-settings-modal.component.html',
  styleUrls: ['./plot-settings-modal.component.less']
})
export class PlotSettingsModalComponent {
  private _data: PlotData = {
    id: "",
    filename: "",
    df: new DataFrame(),
    form: null,
    settings: null,
    samples: [],
    plotType: "",
    searchLinkTo: "",
  }

  sampleMap: any = {}
  sampleConditions: string[] = []
  colorMap: any = {}

  private _filenameList: string[] = []
  @Input() set filenameList(value: string[]) {
    this._filenameList = value
  }
  get filenameList(): string[] {
    return this._filenameList
  }
  @Input() set data(value: PlotData) {
    this._data = value
    this.formUniversal.controls["searchLinkTo"].setValue(this._data.searchLinkTo)
    switch (this._data.plotType) {
      case "bar-chart":
        const formComponents: any = {}
        for (const sample of this._data.samples) {
          formComponents[sample.column] = [this._data.settings.sampleVisibility[sample.column],]
          if (!this.sampleMap[sample.condition]) {
            this.sampleMap[sample.condition] = []
          }
          this.sampleMap[sample.condition].push(sample)
        }
        this.sampleConditions = Object.keys(this.sampleMap)
        for (const condition of this.sampleConditions) {
          this.colorMap[condition] = this._data.settings.colorMap[condition].slice()
        }
        this.form = this.fb.group(formComponents)

    }
  }

  get data(): PlotData {
    return this._data
  }

  form: FormGroup| undefined
  formUniversal = this.fb.group({
    searchLinkTo: [this._data.searchLinkTo,],
    extraMetaDataDBID: ["",],
  })

  searchLinks: string[] = Array.from(this.dataService.searchSubject.keys())

  constructor (private modal: NgbActiveModal, private fb: FormBuilder, private dataService: DataService) {

  }

  submit() {
    const samples: any[] = []
    for (const condition of this.sampleConditions) {
      samples.push(...this.sampleMap[condition])
    }
    const result: any = {
      searchLinkTo: this.formUniversal.value.searchLinkTo,
      extraMetaDataDBID: this.formUniversal.value.extraMetaDataDBID,
    }
    result.sampleVisibility = this.form?.value
    result.colorMap = this.colorMap
    result.samples = samples
    this.modal.close(result)
  }

  close() {
    this.modal.dismiss()
  }

  moveSampleUp(sample: any) {
    const index = this.sampleMap[sample.condition].indexOf(sample)
    if (index > 0) {
      this.sampleMap[sample.condition].splice(index, 1)
      this.sampleMap[sample.condition].splice(index - 1, 0, sample)
    }
  }

  moveSampleDown(sample: any) {
    const index = this.sampleMap[sample.condition].indexOf(sample)
    if (index < this.sampleMap[sample.condition].length - 1) {
      this.sampleMap[sample.condition].splice(index, 1)
      this.sampleMap[sample.condition].splice(index + 1, 0, sample)
    }
  }

  moveConditionUp(condition: string) {
    const index = this.sampleConditions.indexOf(condition)
    if (index > 0) {
      this.sampleConditions.splice(index, 1)
      this.sampleConditions.splice(index - 1, 0, condition)
    }
  }

  moveConditionDown(condition: string) {
    const index = this.sampleConditions.indexOf(condition)
    if (index < this.sampleConditions.length - 1) {
      this.sampleConditions.splice(index, 1)
      this.sampleConditions.splice(index + 1, 0, condition)
    }
  }
}
