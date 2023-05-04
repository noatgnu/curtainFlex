import { Component } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {DataService} from "../services/data.service";
import {AccountsService} from "../services/accounts.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent {
  constructor(private route: ActivatedRoute, private data: DataService, private accounts: AccountsService) {
    this.route.params.subscribe(params => {

      if (params["settings"]) {
        if (params["settings"] && params["settings"].startsWith("access_token")){
          console.log(params["settings"])
        } else if (params["settings"] && params["settings"].length > 0) {
          const settings = params["settings"].split("&")
          let token: string = ""
          if (settings.length > 1) {
            token = settings[1]
            this.data.currentSession.tempLink = true
          } else {
            this.data.currentSession.tempLink = false
          }
          if (this.data.currentSession.id !== settings[0]) {
            this.data.currentSession.id = settings[0]
            this.accounts.curtainAPI.getSessionSettings(settings[0]).then((d:any)=> {
              this.data.currentSession.data = d.data
              this.accounts.curtainAPI.postSettings(settings[0], token).then((data:any) => {
                if (data.data) {
                  this.data.processJSON(data.data).then()
                }
                this.accounts.curtainAPI.getOwnership(settings[0]).then((data:any) => {
                  if (data.ownership) {
                    this.accounts.isOwner = true
                  } else {
                    this.accounts.isOwner = false
                  }
                }).catch(error => {
                  this.accounts.isOwner = false
                })
              })
            })
          }
        }
      }
    })
  }

}
