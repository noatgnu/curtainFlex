import {Component, Input} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormGroup} from "@angular/forms";
import {InputFile} from "../../classes/input-file";
import {PlotData} from "../../interface/plot-data";

@Component({
  selector: 'app-imported-data-management-modal',
  templateUrl: './imported-data-management-modal.component.html',
  styleUrls: ['./imported-data-management-modal.component.less']
})
export class ImportedDataManagementModalComponent {
  private _data = {files: new Map<string, InputFile>(), filenameList: [], extraMetaData: new Map<string, any>(), plotLists: []}
  files = new Map<string, any>()
  filenameList = []
  extraMetaData = new Map<string, any>()
  plotLists: PlotData[] = []
  @Input() set data(value: any) {
    this._data = value
    this._data.files.forEach((v, k) => this.files.set(k, v))
    this.filenameList = [...this._data.filenameList]
    this._data.extraMetaData.forEach((v, k) => this.extraMetaData.set(k, v))
    this.plotLists = [...this._data.plotLists]
    console.log(this.plotLists)
    for (const f of this._data.filenameList) {
      this.formMap[f] = this.fb.group({...this.extraMetaData.get(f).form})
      this.ptmFormMap[f] = this.fb.group({...this.extraMetaData.get(f).ptmForm})
      this.formToggleStateMap[f] = false
    }
    for (const f of this.plotLists) {
      if (!this.fileUsageMap[f.filename]) {
        this.fileUsageMap[f.filename] = []
      }
      if (!this.fileUsageMap[f.filename].includes(f)) {
        this.fileUsageMap[f.filename].push(f)
      }
      if (f.extraMetaDataDBID) {
        if (!this.fileUsageMap[f.extraMetaDataDBID]) {
          this.fileUsageMap[f.extraMetaDataDBID] = []
        }
        if (!this.fileUsageMap[f.extraMetaDataDBID].includes(f)) {
          this.fileUsageMap[f.extraMetaDataDBID].push(f)
        }
      }
    }
  }

  fileUsageMap: { [key: string]: PlotData[] } = {}

  get data(): any {
    return this._data
  }
  formMap: { [key: string]: FormGroup } = {}
  ptmFormMap: { [key: string]: FormGroup } = {}
  formToggleStateMap: { [key: string]: boolean } = {}

  constructor(private modal: NgbActiveModal, private fb: FormBuilder) {

  }

  submit() {
    for (const f of this.filenameList) {
      this.extraMetaData.get(f).form = this.formMap[f].value
      this.extraMetaData.get(f).ptmForm = this.ptmFormMap[f].value
    }
    this.modal.close({files: this.files, filenameList: this.filenameList, extraMetaData: this.extraMetaData, this: this.plotLists})
  }

  deleteFile(filename: string) {
    this.files.delete(filename)
    this.extraMetaData.delete(filename)
    this.plotLists = this.plotLists.filter(p => (p.filename !== filename) && (p.extraMetaDataDBID !== filename))
    this.filenameList.splice(this.data.filenameList.indexOf(filename), 1)
  }

  close() {
    this.modal.dismiss()
  }

  toggleForm(filename: string) {
    this.formToggleStateMap[filename] = !this.formToggleStateMap[filename]
  }
}
