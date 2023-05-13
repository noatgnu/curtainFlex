import {Component, Input} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-stringdb-interactive',
  templateUrl: './stringdb-interactive.component.html',
  styleUrls: ['./stringdb-interactive.component.less']
})
export class StringdbInteractiveComponent {
  private _data: any = {}
  @Input() set data(value: any) {
    this._data = value
    this.divID = "stringdb-interactive-" + this._data["primaryID"]
  }

  get data(): any {
    return this._data
  }
  divID: string = ""

  baseUrl: string = 'https://string-db.org'
  webCGIDir: string = '/cgi/'
  webImagesDir: string = '/images/'
  svgWidth: number = 800
  svgHeight: number = 800
  svgMetaInfoNodes: any = {}
  constructor(private http: HttpClient) { }

  ngAfterViewInit() {

  }

  getStringDB() {
    const stringDiv = document.getElementById(this.divID)
    var form = new FormData()
    for (let key in this.data.params) {
      let value = this.data.params[key]
      if (key === "identifiers") {
        const proteins = value.join("%0d")
        form.append(key, proteins)
      } else {
        form.append(key, value)
      }
    }
    this.http.post(`${this.baseUrl}/api/interactive_svg/network`, form, {responseType: 'text', observe: "body"}).subscribe((data: any) => {
      if (stringDiv) {
        stringDiv.innerHTML = data
      }
      this.init_network_interactive_functionalities();
      this.update_network_coordinates_at_server = function() {};
    })
  }

  init_network_interactive_functionalities() {

  }

  update_network_coordinates_at_server() {
    const networkObject: any = document.getElementById("network_object")
    let networkDocument: Document| null;
    let parentDocument: Document| null;
    if (networkObject) {
      networkDocument = networkObject.contentDocument;
      parentDocument = document;
    } else {
      networkDocument = document;
      parentDocument = networkDocument;
    }

    if (!networkDocument) {
      return;
    }
    const svgElement = networkDocument.getElementById("svg_network_image");
    if (!svgElement) {
      return;
    }
    const r = svgElement.getBoundingClientRect();
    this.svgWidth = r.width;
    this.svgHeight = r.height;
    const nodeWrapperElements = networkDocument.querySelectorAll(".nwnodecontainer");
    if (nodeWrapperElements) {
      nodeWrapperElements.forEach((elem: any) => {
        let thisID = elem.id;
        this.svgMetaInfoNodes[thisID] = {};
        this.svgMetaInfoNodes[thisID].elm = elem;
        this.svgMetaInfoNodes[thisID].elm.node = this.svgMetaInfoNodes[thisID];
        this.svgMetaInfoNodes[thisID].x = Number (elem.getAttribute ("data-x_pos"));
        this.svgMetaInfoNodes[thisID].y = Number (elem.getAttribute ("data-y_pos"));
        this.svgMetaInfoNodes[thisID].radius = Number (elem.getAttribute ("data-radius"));
        this.svgMetaInfoNodes[thisID].ix = this.svgMetaInfoNodes[thisID].x;
        this.svgMetaInfoNodes[thisID].iy = this.svgMetaInfoNodes[thisID].y;
        this.svgMetaInfoNodes[thisID].links = [];
        this.setMovableNode(elem);
        elem.addEventListener ("click", this.handleNetworkNodeClick);
      });
    }
  }

  setMovableNode (elem: any) {
    elem.hasMoved = false;
    elem.isInFront = false;
    elem.isBeingDragged = false;
    elem.originalEventTarget = null;

    elem.onmousedown = this.moveObjectMDown;
    elem.ontouchstart = this.moveObjectTDown;


  }

  moveObjectMDown (event: any) {

    return false;
  }

  moveObjectTDown (event: any) {
    return false;
  }

  handleNetworkNodeClick (event: any) {

  }
}
