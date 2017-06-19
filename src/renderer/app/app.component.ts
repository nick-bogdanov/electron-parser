import { Component } from '@angular/core'
import { ISites, ISiteOptions } from './site/sites.interface'
import { ISitesLinks } from './navigation/sites.links.interface'
import { ipcRenderer } from 'electron'

@Component({
    selector: 'app',
    templateUrl: './app.partial.html'
})

export class AppComponent {
    public currentSite: ISitesLinks;
    public site: ISites = {};
    public siteOptions: ISites = {};

    constructor() {

    }

    setCurrentSite(site: ISitesLinks): void {
        this.currentSite = site;
    }

    setDataToComponentModel(options: ISiteOptions): void {
        console.log('options: ', options);
        this.siteOptions[options.site] = options
    }

    exportToExcel() {
        ipcRenderer.send('export-to-excel', {})
    }

}