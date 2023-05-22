import {Component, Input} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-annotation-modal',
  templateUrl: './annotation-modal.component.html',
  styleUrls: ['./annotation-modal.component.less']
})
export class AnnotationModalComponent {
  private _data: any = {}
  colorMap: any = {}

  @Input() set data(value: any) {
    this._data = value
    for (const s in value){
      this.forms.push(this.fb.group({
        annotationID: [s],
        text: [value[s].data.text],
        showarrow: [value[s].data.showarrow],
        arrowhead: [value[s].data.arrowhead],
        arrowsize: [value[s].data.arrowsize],
        arrowwidth: [value[s].data.arrowwidth],
        ax: [value[s].data.ax],
        ay: [value[s].data.ay],
        fontsize: [value[s].data.font.size],
        fontcolor: [value[s].data.font.color],
        showannotation: [value[s].status],
      }))
      this.colorMap[s] = value[s].data.font.color.slice()
    }
    console.log(this.colorMap)
  }

  forms: FormGroup[] = []

  get data(): any {
    return this._data
  }

  constructor(private modal: NgbActiveModal, private fb: FormBuilder) {

  }

  submit() {
    this.modal.close(this.forms)
  }

  close() {
    this.modal.dismiss()
  }

  updateColor(event: any, id: string) {
    this.forms.find((f) => f.controls["annotationID"].value === id)?.controls["fontcolor"].setValue(event)
  }
}
