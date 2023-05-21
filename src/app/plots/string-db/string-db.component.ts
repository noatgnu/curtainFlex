import {Component, ElementRef, ViewChild} from '@angular/core';
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

  constructor() {

  }
}
