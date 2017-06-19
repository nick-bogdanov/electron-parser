import { Component } from '@angular/core';
import { ISites } from './site/sites.interface';

@Component({
    selector: 'app',
    templateUrl: './app.partial.html'
})

export class AppComponent {
    public currentSite: string;
    public site: ISites = {};

    constructor() {
        
     }

    setCurrentSite(name: string): void {
        this.currentSite = name;
    }

    setDataToComponentModel() {

    }

}