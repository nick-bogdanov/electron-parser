import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { NavigationComponent } from './navigation/navigation.component';
import { fUAComponent } from './f_ua/f_ua.component';
import { AvtoRadosti } from './avtoradosti/avtoradosti.component';

import { AppComponent } from './app.component';


@NgModule({
  imports: [
    BrowserModule,
    FormsModule
  ],
  declarations: [
    NavigationComponent,
    AppComponent,
    fUAComponent,
    AvtoRadosti
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }