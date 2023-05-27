import { Component } from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-about-us-modal',
  templateUrl: './about-us-modal.component.html',
  styleUrls: ['./about-us-modal.component.less']
})
export class AboutUsModalComponent {
  constructor(private modal: NgbActiveModal) {
  }
  close() {
    this.modal.dismiss()
  }
}
