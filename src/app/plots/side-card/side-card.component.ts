import {Component, Input} from '@angular/core';
import {PdbViewerModalComponent} from "../../modal/pdb-viewer-modal/pdb-viewer-modal.component";
import {ProteinDomainModalComponent} from "../../modal/protein-domain-modal/protein-domain-modal.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-side-card',
  templateUrl: './side-card.component.html',
  styleUrls: ['./side-card.component.less']
})
export class SideCardComponent {
  private _data: any = {}

  geneName: string = ""
  uniprotAcc: string = ""
  metaData: any = {}

  hasExtra: boolean = false
  primaryId: string = ""
  proteinName: string = ""
  relatedVolcano: any = {}

  @Input() set data(value: any) {
    console.log(value)
    this.hasExtra = value["hasExtra"]
    this.primaryId = value["primaryId"]
    this.geneName = value["metaData"]["Gene Names"]
    this.uniprotAcc = value["metaData"]["Entry"]
    this.proteinName = value["metaData"]["Protein names"]
    this.metaData = value["metaData"]
    this.relatedVolcano = value["relatedVolcano"]
  }

  constructor(private modal: NgbModal) { }

  openPDBViewer() {
    const ref = this.modal.open(PdbViewerModalComponent, {size: 'xl'})
    ref.componentInstance.data = {geneName: this.geneName, uniprotAcc: this.uniprotAcc}
  }

  openProteinDomainViewer() {
    const ref = this.modal.open(ProteinDomainModalComponent, {size: 'xl'})
    ref.componentInstance.data = this.metaData
  }
}
