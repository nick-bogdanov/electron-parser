import { Component } from '@angular/core';
import {ipcRenderer} from 'electron'

@Component({
    selector: 'f-ua',
    templateUrl: './f_ua.partial.html'
})

export class fUAComponent {
    public onUpdateData:any
    public onSingleDataUpdated:any

    constructor() {
        this.onUpdateData = null
        this.onSingleDataUpdated = null
    }

    $releaseTheBeast() {
        console.log('parsing has been started')

        ipcRenderer.send('start-parse-f-ua', {})

        ipcRenderer.on('f-ua-results', this.onUpdateData)
        ipcRenderer.on('single-product', this.onSingleDataUpdated)
    }

    export() {
         ipcRenderer.send('export-to-excel', {})
    }
}
