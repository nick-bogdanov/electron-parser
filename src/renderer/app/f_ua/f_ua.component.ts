import { Component } from '@angular/core';
import { ipcRenderer, shell } from 'electron';
import * as _ from 'lodash';

@Component({
    selector: 'f-ua',
    templateUrl: './f_ua.partial.html'
})

export class fUAComponent {
    public renderedData: any;

    constructor() {
    }

    ngOnInit() {
        console.log('inited')
        ipcRenderer.send('start-parse-f-ua', {})
        ipcRenderer.on('f-ua-results', this.onUpdateData)
        ipcRenderer.on('single-product', this.onSingleDataUpdated)
    }

    onUpdateData(args) {
        this.renderedData = _.flatten(args)
    }

    onSingleDataUpdated() { }

    ngOnDestroy() {
        console.log('destroy')
    }

    openLink(link) {
        shell.openExternal(link)
    }

    export() {
        ipcRenderer.send('export-to-excel', {})
    }
}
