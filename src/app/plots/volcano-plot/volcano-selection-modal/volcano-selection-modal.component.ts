import {Component, Input} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-volcano-selection-modal',
  templateUrl: './volcano-selection-modal.component.html',
  styleUrls: ['./volcano-selection-modal.component.less']
})
export class VolcanoSelectionModalComponent {
  @Input() data: any[] = []

  page = 1
  pageSize = 5


  form = this.fb.group({
    title: ['',],
  })

  constructor(private fb: FormBuilder, private modal: NgbActiveModal) {
  }

  submit() {
    this.modal.close({title: this.form.value.title})
  }

  close() {
    this.modal.dismiss()
  }
}
