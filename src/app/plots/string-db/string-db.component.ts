import {Component, ElementRef, Input, ViewChild} from '@angular/core';
declare const getSTRING: any;
@Component({
  selector: 'app-string-db',
  templateUrl: './string-db.component.html',
  styleUrls: ['./string-db.component.less']
})
export class StringDbComponent {
  @ViewChild("stringElement") stringElement: ElementRef|undefined
  networkType = "physical"
  networkFlavor: string = "evidence"
  organism = ""
  ids: string[] = []
  selected = ""
  selectedGenes: string[] = []
  selection: string = ""
  requiredScore: number = 0

  private _data: any = {}

  @Input() set data(value: any) {

  }
  get data(): any {
    return this._data
  }

  constructor() {

  }

  getString() {
    if (this.requiredScore > 1000) {
      this.requiredScore = 1000
    }
    const increased: string[] = []
    const decreased: string[] = []
    const allGenes: string[] = []

    if (this.selection !== "") {
    }


    setTimeout(()=> {
      getSTRING('https://string-db.org',
        {'species': this.organism,
          'identifiers': this.ids,
          'network_flavor': this.networkFlavor,
          'caller_identity': 'dundee.ac.uk',
          'network_type': this.networkType,
          'required_score': this.requiredScore},
        [],
        increased,
        decreased,
        allGenes
      )
      console.log("String request submitted")
    }, 3000)
  }
}
