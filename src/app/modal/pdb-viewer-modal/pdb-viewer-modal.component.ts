import {AfterContentInit, Component, Input} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {getEBIAlpha} from "curtain-web-api";


declare const PDBeMolstarPlugin: any;

@Component({
  selector: 'app-pdb-viewer-modal',
  templateUrl: './pdb-viewer-modal.component.html',
  styleUrls: ['./pdb-viewer-modal.component.less']
})
export class PdbViewerModalComponent implements AfterContentInit{
  private _data: any = {geneName: "", uniprotAcc: ""}
  uni: any = {}
  @Input() set data(value: any) {
    this._data = value;
  }

  get data(): any {
    return this._data
  }

  link = ""
  cifLink = ""
  modelCreatedDate = ""
  entryID = ""
  version = 0
  alignmentError = ""
  geneName: string = ""

  constructor(private modal: NgbActiveModal) {

  }

  close() {
    this.modal.close()
  }

  ngAfterContentInit() {
    setTimeout(()=> {
      getEBIAlpha(this.data.uniprotAcc).then((data: any) => {
        this.link = data.data[0]["pdbUrl"]
        this.modelCreatedDate = data.data[0]["modelCreatedDate"]
        this.version = data.data[0]["latestVersion"]
        this.entryID = data.data[0]["entryId"]
        this.alignmentError = data.data[0]["paeImageUrl"]
        this.cifLink = data.data[0]["cifUrl"]
        const molstar = new PDBeMolstarPlugin()
        const options = {
          customData: {
            url: this.cifLink,
            format: "cif",
            binary: false
          },
          alphafoldView: true,
          bgColor: {r:255, g:255, b:255}
        }

        //Get element from HTML/Template to place the viewer
        const viewerContainer = document.getElementById('molstar');

        //Call render method to display the 3D view
        molstar.render(viewerContainer, options);
      }), 4000
    })
  }
}
