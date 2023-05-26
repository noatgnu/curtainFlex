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
  uniprotProgressSubjectMap: Map<string, Subject<{progressValue: number, progressText: string}>> = new Map<string, Subject<{progressValue: number, progressText: string}>>()
  segments: string[] = []
  segmentCount: number = 0
  constructor(private http: HttpClient) { }

  async getUniprot(accs: string[], accMap: Map<string, string[]>) {
    this.segments = []
    this.segmentCount = Math.ceil(accs.length/10000)
    const parser = new Parser(5, "accession,id,gene_names,protein_name,organism_name,organism_id,length,xref_refseq,ft_var_seq,cc_alternative_products,ft_domain,xref_string,organism_id")
    const res = await parser.parse((accs))
    const dataMap: Map<string, string> = new Map<string, string>()
    const db: Map<string, any> = new Map<string, any>()
    this.progressValue = 100
    this.progressText = `Started Processing UniProt Data with ${this.segmentCount} segments`
    const geneList: any[] = []
    const segmentStatus: any = {}


    for await (const result of res) {
      const segment = `${result.segment}`
      if (!this.uniprotProgressSubjectMap.has(segment)) {
        segmentStatus[segment] = {progressValue: 0, progressText: "", currentRun: 1, totalRun: Math.ceil(result.total/500), running: true}
        this.uniprotProgressSubjectMap.set(segment, new Subject<{progressValue: number, progressText: string}>())
        this.segments.push(segment)

      }
      const segmentProgressSubject = this.uniprotProgressSubjectMap.get(segment)
      segmentStatus[segment].totalRun = Math.ceil(result.total/500)
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
      segmentStatus[segment].progressValue = segmentStatus[segment].currentRun * 100/segmentStatus[segment].totalRun
      segmentStatus[segment].progressText = `Processed UniProt Job ${segmentStatus[segment].currentRun}/${segmentStatus[segment].totalRun}`
      if (segmentProgressSubject) {
        segmentProgressSubject.next({progressValue: segmentStatus[segment].progressValue, progressText: segmentStatus[segment].progressText})
        if (segmentStatus[segment].currentRun === segmentStatus[segment].totalRun) {
          segmentProgressSubject.next({progressValue: 100, progressText: "Finished"})
        }
      }
      segmentStatus[segment].currentRun ++
    }
    this.progressText = "Finished"
    this.segments = []
    this.uniprotProgressSubjectMap.clear()
    return {db: db, dataMap: dataMap, geneList: geneList}
  }

  getIndividualEntry(acc: string) {
    return this.http.get(`https://rest.uniprot.org/uniprotkb/${acc}.json`, {observe: "body"})
  }
}
