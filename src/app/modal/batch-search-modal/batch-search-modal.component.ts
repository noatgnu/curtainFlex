import { Component } from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {BatchSearchService} from "../../services/batch-search.service";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-batch-search-modal',
  templateUrl: './batch-search-modal.component.html',
  styleUrls: ['./batch-search-modal.component.less']
})
export class BatchSearchModalComponent {
  form = this.fb.group({
    title: ['',],
    terms: ['',],
    searchType: ['gene-names',],
  })

  filterList: any[] = []

  constructor(private bs: BatchSearchService, private fb: FormBuilder, private modal: NgbActiveModal) {
    this.bs.getDefaultFilterList().then((data: any) => {
      this.filterList = data.data.results.map((a: any) => {
        return {name: a.name, id: a.id}
      })
    })
  }

  updateTextWithBuiltinList(id: any) {
    if (id !== '') {
      this.bs.getSpecificListById(id).then((data: any) => {
        this.form.controls['title'].setValue(data.data.name)
        this.form.controls['terms'].setValue(data.data.data)
      })
    }
  }

  close() {
    this.modal.dismiss()
  }

  search() {
    const result: any = {}
    if (this.form.value["title"] && this.form.value["terms"]) {
      if (this.form.value["title"] !== "" && this.form.value["terms"] !== "") {
        for (const r of this.form.value["terms"].split("\n")) {
          const a = r.trim()
          if (a !== "") {
            const e = a.split(";")
            if (!result[a]) {
              result[a] = []
            }
            for (let f of e) {
              f = f.trim()
              result[a].push(f)
            }
          }
        }
        this.modal.close({title: this.form.value["title"], data: result, searchType: this.form.value["searchType"], params: {}})
      }
    }
  }
}
