import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {DataService} from "../../services/data.service";
import {PlotData} from "../../interface/plot-data";
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
  relatedVolcano: PlotData[] = []
  selectedVolcanoID: string = ""
  isPTM: boolean = false
  @Input() set data(value: any) {
    this._data = value
    console.log(value)
    this.ids = this.data.metaData["STRING"].split(';').filter((i: string) => i !== "")
    this.organism = this.ids[0].split('.')[0]
    this.selectedGenes = this.data.metaData["Gene Names"].split(';')
    this.selected = this.selectedGenes[0]
    if (this.data.searchLinkTo) {
      this.relatedVolcano = this.dataService.plotLists.filter((i: PlotData) => (i.searchLinkTo === this.data.searchLinkTo) && (i.plotType === "volcano-plot"))
      if (this.relatedVolcano.length > 0) {
        this.selectedVolcanoID = this.relatedVolcano[0].id
        if (this.relatedVolcano[0].ptm) {
          this.isPTM = true
        }
      }
    }

    if (this.selected !== "" && this.selected !== undefined) {
      this.getString().then()
    }
  }
  get data(): any {
    return this._data
  }

  constructor(private dataService: DataService) {

  }

  async getString() {
    if (this.requiredScore > 1000) {
      this.requiredScore = 1000
    }
    let increased: string[] = []
    let decreased: string[] = []
    let allGenes: string[] = []
    if (!this.isPTM) {
      if (this.selectedVolcanoID !== "" && this.selectedVolcanoID !== undefined) {
        const volcanoData = this.dataService.differentialMap.get(this.selectedVolcanoID)
        if (volcanoData) {
          Object.values(volcanoData.increase).forEach((i: any) => {
            increased.push(...i.geneNames)
          })
          Object.values(volcanoData.decrease).forEach((i: any) => {
            decreased.push(...i.geneNames)
          })
          allGenes = increased.concat(decreased)
          Object.values(volcanoData.notSignificant).forEach((i: any) => {
            allGenes.push(...i.geneNames)
          })
        }
      }
    }


    setTimeout(()=> {
      getSTRING('https://string-db.org',
        {'species': this.organism,
          'identifiers': this.ids,
          'network_flavor': this.networkFlavor,
          'caller_identity': 'dundee.ac.uk',
          'network_type': this.networkType,
          'required_score': this.requiredScore},
        this.selectedGenes,
        increased,
        decreased,
        allGenes
      )
      console.log("String request submitted")
    }, 3000)
  }
}
