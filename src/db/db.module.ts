import { NgModule } from "@angular/core";
import { DBhelper } from "./impl/db.helper";
import { DBService } from "./def/db.service";

@NgModule({
    providers: [
        { provide: DBService, useClass: DBhelper},
    ]
})
export class DBModule {

}