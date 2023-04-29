import {Component, Input} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {DataFrame, fromCSV, IDataFrame} from "data-forge";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {Parser, Accession} from "uniprotparserjs";

@Component({
  selector: 'app-select-extra-metadata-modal',
  templateUrl: './select-extra-metadata-modal.component.html',
  styleUrls: ['./select-extra-metadata-modal.component.less']
})
export class SelectExtraMetadataModalComponent {
  private _data: IDataFrame = new DataFrame()
  progressValue = 0
  progressText = ""

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
  })
  constructor(private fb: FormBuilder, private modal: NgbActiveModal) {
  }

  skip() {
    this.modal.dismiss()
  }

  submit() {
    if (!this.form.value["enableLink"]) {
      if (this.form.value["column"] && this.form.value["primaryID"]) {
        const accMap = new Map<string, string[]>()
        const primaryIDMap = new Map<string, string[]>()
        const accs: string[] = []
        for (const r of this.data) {
          primaryIDMap.set(r[this.form.value["primaryID"]], r[this.form.value["column"]])
          const accSplit = r[this.form.value["column"]].split(";")
          accMap.set(r[this.form.value["column"]], [r[this.form.value["column"]]])
          for (const acc of accSplit) {
            if (!accMap.has(acc)) {
              accMap.set(acc, [r[this.form.value["column"]]])
            } else {
              const accList = accMap.get(acc)
              if (accList) {
                const checkIfExist = accList.find(value => value === acc)
                if (checkIfExist === undefined) {
                  accList.push(r[this.form.value["column"]])
                  accMap.set(acc, accList)
                }
              }
            }
          }
          switch (this.form.value["source"]) {
            case "uniprot":
              const accession = new Accession(accSplit[0], true)
              if (accession.acc !== undefined && accession.acc !== "") {
                const accList = accMap.get(r[this.form.value["column"]])
                if (accList) {
                  accList.push(accession.acc.slice())
                  accMap.set(r[this.form.value["column"]], accList)
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

        if (accs.length > 0) {
          switch (this.form.value["source"]) {
            case "uniprot":
              this.getUniprot(accs, accMap).then((result) => {
                this.modal.close({db: result.db, dataMap: result.dataMap, form: this.form.value, accMap: accMap, primaryIDMap: primaryIDMap})
              })
              break
          }
        }
      }
    } else {
      this.modal.close({form: this.form.value})
    }

  }


  async getUniprot(accs: string[], accMap: Map<string, string[]>) {
    let currentRun = 1
    let totalRun = Math.ceil(accs.length/500)
    const parser = new Parser(5, "accession,id,gene_names,protein_name,organism_name,organism_id,length,xref_refseq,ft_var_seq,cc_alternative_products")
    const res = await parser.parse((accs))
    const dataMap: Map<string, string> = new Map<string, string>()
    const db: Map<string, any> = new Map<string, any>()
    this.progressValue = 100
    this.progressText = "Started Processing UniProt Data"
    for await (const result of res) {
      totalRun = Math.ceil(result.total/500)
      // @ts-ignore
      const df = fromCSV(result.data, {delimiter: "\t"})
      for (const r of df) {
        if (r["Gene Names"]) {
          r["Gene Names"] = r["Gene Names"].replaceAll(" ", ";").toUpperCase()
        }

        db.set(r["Entry"], r)
        dataMap.set(r["From"], r["Entry"])

        dataMap.set(r["Entry"], r["Entry"])
        if (accMap.has(r["Entry"])) {
          const a = accMap.get(r["Entry"])
          if (a) {
            for (const query of a) {
              const que = query.replace(",", ";")
              for (const q of que.split(";")) {
                dataMap.set(q, r["Entry"])
              }
            }
          }
        }
      }
      this.progressValue = currentRun * 100/totalRun
      this.progressText = `Processed UniProt Job ${currentRun}/${totalRun}`
      currentRun ++
    }
    return {db: db, dataMap: dataMap}
  }
}
