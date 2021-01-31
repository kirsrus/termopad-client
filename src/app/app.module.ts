import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MaterialModule} from './material.module';
import {GraphQLModule} from './graphql.module';
import {HttpClientModule} from '@angular/common/http';
import {ModalPersonInfoComponent} from './modal-person-info/modal-person-info.component';
import {ChartsModule} from 'ng2-charts';
import {TemperatureBoxComponent} from './temperature-box/temperature-box.component';
import { ModalTermapadInfoComponent } from './modal-termapad-info/modal-termapad-info.component';

@NgModule({
  declarations: [
    AppComponent,
    ModalPersonInfoComponent,
    TemperatureBoxComponent,
    ModalTermapadInfoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    GraphQLModule,
    HttpClientModule,
    ChartsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [ModalPersonInfoComponent]
})
export class AppModule {
}
