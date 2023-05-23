import {Component, Input} from '@angular/core';
import {PlotData} from "../../interface/plot-data";
import {DataFrame} from "data-forge";
import {DataService} from "../../services/data.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {BatchSearchModalComponent} from "../../modal/batch-search-modal/batch-search-modal.component";
import {FormBuilder} from "@angular/forms";
import {debounceTime, distinctUntilChanged, map, Observable, OperatorFunction} from "rxjs";
import {PlotSettingsModalComponent} from "../../modal/plot-settings-modal/plot-settings-modal.component";
import {PdbViewerModalComponent} from "../../modal/pdb-viewer-modal/pdb-viewer-modal.component";

@Component({
  selector: 'app-plot-container',
  templateUrl: './plot-container.component.html',
  styleUrls: ['./plot-container.component.less']
})
export class PlotContainerComponent {
  _data: PlotData = {
    id: "",
    filename: "",
    df: new DataFrame(),
    form: null,
    settings: null,
    samples: [],
    plotType: "",
    searchLinkTo: "",
    ptm: false,
  }

  formChangeStatus: boolean = false

  @Input() position: number = 0

  @Input() set data(value: PlotData) {
    console.log(value)
    if (value !== this._data) {
      this._data = value
    }
  }

  get data() {
    return this._data
  }

  searchTypeOptions = [
    {value: 'gene-names', label: 'Gene Names', enabled: true},
    {value: 'uniprot-acc', label: 'UniProt Accession', enabled: false},
    {value: 'primary-id', label: 'Primary ID', enabled: true},
  ]


  form = this.fb.group({
    searchType: ['gene-names',],
    term: ['',],
  })

  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
    return text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) => {
        if (term.length < 2) {
          return []
        } else {
          return this.searchTerm(term)
        }
      })
    )
  }


  constructor(public dataService: DataService, private modal: NgbModal, private fb: FormBuilder) {

  }

  updateFormChangeStatus(status: boolean) {
    this.formChangeStatus = status
  }

  openBatchSearchModal() {
    const ref = this.modal.open(BatchSearchModalComponent, {size: 'lg'})
    ref.closed.subscribe((data: any) => {
      if (data) {
        const pids: string[] = []
        for (const term of Object.keys(data.data)) {
          const pid = this.getSearchPID(term, data.searchType)
          if (pid) {
            pids.push(...pid)
          }
        }
        this.dataService.searchSubject.get(this.data.searchLinkTo)?.next(
          {primaryIds: pids, searchType: data.searchType, title: data.title, operation: "data-selection"}
        )
      }
    })
  }

  searchTerm(term: string) {
    switch (this.form.value.searchType) {
      case 'gene-names':
        if (this.data.extraMetaDataDBID) {
          const extra = this.dataService.extraMetaData.get(this.data.extraMetaDataDBID)
          if (extra) {
            const results = extra.geneList.filter((geneName: any) => {
              return geneName["gene"].toLowerCase().includes(term.toLowerCase())
            })
            return results.slice(0, 10).map((geneName: any) => geneName["gene"])
          }
        } else {
          return []
        }
        return []
      case 'primary-id':
        const pid = this.data.df.getSeries(this.data.form.primaryID).where((a: string) => a.toLowerCase().includes(term.toLowerCase())).head(10).toArray()
        if (pid.length > 0) {
          return pid
        } else {
          return []
        }
    }
    return []
  }

  searchData() {
    const term = this.form.value.term
    const searchType = this.form.value.searchType
    const pid = this.getSearchPID(term, searchType);
    if (pid) {
      switch (searchType) {
        case 'gene-names':
          this.dataService.searchSubject.get(this.data.searchLinkTo)?.next(
            {primaryIds: [...pid], type: 'gene-names', title: this.form.value.term, operation: "data-selection"}
          )
          break
        case 'primary-id':
          this.dataService.searchSubject.get(this.data.searchLinkTo)?.next(
            {primaryIds: [...pid], type: 'primary-id', title: "", operation: "data-selection"})
          break
      }
    }

  }

  private getSearchPID(term: string | null | undefined, searchType: string | null | undefined) {
    if (term && searchType) {
      switch (searchType) {
        case 'gene-names':
          if (this.data.extraMetaDataDBID) {
            const extra = this.dataService.extraMetaData.get(this.data.extraMetaDataDBID)
            if (extra) {
              const selected = extra.geneList.find((geneName: any) => {
                if (geneName["gene"].toLowerCase() === term.toLowerCase()) {
                  return true
                } else if (geneName["gene"].toLowerCase().split(";").includes(term.toLowerCase())) {
                  return true
                }
                return false
              })
              if (selected) {
                const acc = extra.accMap.get(selected["acc"])
                if (acc) {
                  const pid = extra.primaryIDMap.get(acc[0])
                  if (pid) {
                    return pid
                  }
                }
              }
            }
          }
          break
        case 'primary-id':
          if (term) {
            return term
          }
      }
    }
  }

  updateSavedSettings(id: string, settings: any) {
    const plot = this.dataService.plotLists.find((plot) => plot.id === id)
    if (plot) {
      plot.settings = settings
    }
  }

  openSettingsModal() {
    const ref = this.modal.open(PlotSettingsModalComponent)
    ref.componentInstance.data = this.data
    ref.componentInstance.filenameList = this.dataService.data.filenameList.filter((value) => {
      return !!(this.dataService.data.files.get(value)?.extraMetaDataDBID && this.dataService.data.files.get(value)?.extraMetaDataDBID !== "");
    })

    ref.closed.subscribe((data: any) => {
      if (data) {
        //copy data from this.data to a new object
        const newData = {...this.data}
        newData.settings.colorMap = data.colorMap
        newData.samples = data.samples
        newData.settings.sampleVisibility = data.sampleVisibility
        if (newData.searchLinkTo !== data.searchLinkTo) {
          newData.searchLinkTo = data.searchLinkTo
          const linkedToPlot = this.dataService.plotLists.find((plot) => plot.id === data.searchLinkTo)
          if (linkedToPlot) {
            newData.settings.categories = [...linkedToPlot.settings.categories]
            newData.settings.selectedMap = {}
            for (const id in linkedToPlot.settings.selectedMap) {
              newData.settings.selectedMap[id] = [...linkedToPlot.settings.selectedMap[id]]
            }
          }
        }

        const inputFile = this.dataService.data.files.get(this.data.filename)
        if (inputFile) {
          if (inputFile.extraMetaDataDBID) {
            if (data.extraMetaDataDBID !== "" && data.extraMetaDataDBID !== inputFile.extraMetaDataDBID) {
              if (newData.extraMetaDataDBID != null) {
                inputFile.extraMetaDataDBID = newData.extraMetaDataDBID
              }
            }
          }

        }
        this.data = newData
      }
    })
  }


}
