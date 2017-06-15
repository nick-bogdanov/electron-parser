import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { NavigationComponent } from './navigation/navigation.component';
import { fUAComponent } from './f_ua/f_ua.component';
import { AvtoRadosti } from './avtoradosti/avtoradosti.component';

import { MaterialModule } from './app.material.module';
import { AppComponent } from './app.component';


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    MaterialModule
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