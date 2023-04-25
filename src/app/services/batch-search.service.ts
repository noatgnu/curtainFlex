import { Injectable } from '@angular/core';
import {AccountsService} from "./accounts.service";

@Injectable({
  providedIn: 'root'
})
export class BatchSearchService {

  constructor(private account: AccountsService) { }

  getDefaultFilterList() {
    return this.account.curtainAPI.getDataFilterList()
  }

  getSpecificListById(id: number) {
    return this.account.curtainAPI.getDataFilterListByID(id)
  }
}
