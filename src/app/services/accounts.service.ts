import { Injectable } from '@angular/core';
import {CurtainWebAPI} from "curtain-web-api";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  curtainAPI: CurtainWebAPI = new CurtainWebAPI(environment.apiURL)
  isOwner: boolean = false
  constructor() {
  }

}
