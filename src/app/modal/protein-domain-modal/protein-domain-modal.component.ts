import {Component, Input} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-protein-domain-modal',
  templateUrl: './protein-domain-modal.component.html',
  styleUrls: ['./protein-domain-modal.component.less']
})
export class ProteinDomainModalComponent {
  private _data: string = ""

  @Input() set data(value: string) {
    this._data = value;
  }

  get data(): string {
    return this._data
  }

  constructor(private modal: NgbActiveModal) {
  }

  close() {
    this.modal.dismiss()
  }
}
