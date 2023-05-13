import {Component, Input} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {DataFrame, fromCSV, IDataFrame} from "data-forge";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {Parser, Accession} from "uniprotparserjs";
import {UniprotService} from "../../services/uniprot.service";

@Component({
  selector: 'app-select-extra-metadata-modal',
  templateUrl: './select-extra-metadata-modal.component.html',
  styleUrls: ['./select-extra-metadata-modal.component.less']
})
export class SelectExtraMetadataModalComponent {
  private _data: IDataFrame = new DataFrame()


  @Input() set data(value: IDataFrame) {
    this._data = value
    this.form.controls["column"].setValue(this._data.getColumnNames()[0])
    this.form.controls["primaryID"].setValue(this._data.getColumnNames()[0])
  }

  get data(): IDataFrame {
    return this._data
  }

  private _filenameList: string[] = []
  @Input() set filenameList(value: string[]) {
    this._filenameList = value
  }

  get filenameList(): string[] {
    return this._filenameList
  }

  form = this.fb.group({
    source: ["uniprot", ],
    column: ["", ],
    primaryID: ["", ],
    linkTo: ["",],
    enableLink: [false,],
    ptm: [false,],
  })

  ptmForm = this.fb.group({
    foldChange: [''],
    minuslog10pValue: [''],
    proteinID: [''],
    peptideSequence: [''],
    positionInPeptide: [''],
    positionInProtein: [''],
    LocalizationProbability: [''],
  })

  constructor(private fb: FormBuilder, private modal: NgbActiveModal, public uniprot: UniprotService) {
    this.uniprot.progressText = ""
    this.uniprot.progressValue = 0
  }

  skip() {
    this.modal.dismiss()
  }

  submit() {
    if (!this.form.value["enableLink"]) {
      if (this.form.value["column"] && this.form.value["primaryID"] && this.form.value["source"]) {
        const {accMap, primaryIDMap, accs} = SelectExtraMetadataModalComponent.getAccs(this.form.value, this.data);

        if (accs.length > 0) {
          switch (this.form.value["source"]) {
            case "uniprot":
              this.uniprot.getUniprot(accs, accMap).then((result) => {
                this.modal.close({db: result.db, dataMap: result.dataMap, form: this.form.value, accMap: accMap, primaryIDMap: primaryIDMap, geneList: result.geneList, ptmForm: this.ptmForm.value})
              })
              break
          }
        }
      }
    } else {
      this.modal.close({form: this.form.value, ptmForm: this.ptmForm.value})
    }

  }


  static getAccs(form: any, data: IDataFrame): {accMap: Map<string, string[]>, primaryIDMap: Map<string, string[]>, accs: string[]} {
    const accMap = new Map<string, string[]>()
    const primaryIDMap = new Map<string, string[]>()
    const accs: string[] = []
    for (const r of data) {
      if (!primaryIDMap.has(r[form["primaryID"]])) {
        primaryIDMap.set(r[form["primaryID"]], [])
      }
      if (!primaryIDMap.has(r[form["column"]])) {
        primaryIDMap.set(r[form["column"]], [])
      }
      primaryIDMap.get(r[form["primaryID"]])?.push(r[form["column"]])
      primaryIDMap.get(r[form["column"]])?.push(r[form["primaryID"]])
      const accSplit = r[form["column"]].split(";")
      accMap.set(r[form["column"]], [r[form["column"]]])
      for (const acc of accSplit) {
        if (!accMap.has(acc)) {
          accMap.set(acc, [r[form["column"]]])
        } else {
          const accList = accMap.get(acc)
          if (accList) {
            const checkIfExist = accList.includes(acc)
            if (!checkIfExist) {
              accList.push(r[form["column"]])
              accMap.set(acc, accList)
            }
          }
        }
      }
      switch (form["source"]) {
        case "uniprot":
          const accession = new Accession(accSplit[0], true)
          if (accession.acc !== undefined && accession.acc !== "") {
            const accList = accMap.get(r[form["column"]])
            if (accList) {
              if (!accList.includes(accession.acc)) {
                accList.push(accession.acc.slice())
                accMap.set(r[form["column"]], accList)
              }
            }
            accs.push(accession.acc)
          } else {
            accs.push(accession.rawAcc)
          }
          break
        default:
          break
      }
    }
    return {accMap, primaryIDMap, accs};
  }


}
