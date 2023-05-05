import { Injectable } from '@angular/core';
import {Parser} from "uniprotparserjs";
import {fromCSV} from "data-forge";
import {Subject} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UniprotService {
  progressValue = 0
  progressText = ""
  progressSubject: Subject<{progressValue: number, progressText: string}> = new Subject()

  constructor(private http: HttpClient) { }

  async getUniprot(accs: string[], accMap: Map<string, string[]>) {
    let currentRun = 1
    let totalRun = Math.ceil(accs.length/500)
    const parser = new Parser(5, "accession,id,gene_names,protein_name,organism_name,organism_id,length,xref_refseq,ft_var_seq,cc_alternative_products,ft_domain")
    const res = await parser.parse((accs))
    const dataMap: Map<string, string> = new Map<string, string>()
    const db: Map<string, any> = new Map<string, any>()
    this.progressValue = 100
    this.progressText = "Started Processing UniProt Data"
    const geneList: any[] = []
    for await (const result of res) {
      totalRun = Math.ceil(result.total/500)
      // @ts-ignore
      const df = fromCSV(result.data, {delimiter: "\t"})
      for (const r of df) {
        if (r["Gene Names"]) {
          r["Gene Names"] = r["Gene Names"].replaceAll(" ", ";").toUpperCase()
          geneList.push({gene: r["Gene Names"], acc: r["Entry"]})
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
      this.progressSubject.next({progressValue: this.progressValue, progressText: this.progressText})
      currentRun ++
    }
    return {db: db, dataMap: dataMap, geneList: geneList}
  }

  getIndividualEntry(acc: string) {
    return this.http.get(`https://rest.uniprot.org/uniprotkb/${acc}.json`, {observe: "body"})
  }
}
