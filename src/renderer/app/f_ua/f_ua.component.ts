

import { SiteCommon } from './../site/site.class';
import { Component, Input, Output, EventEmitter } from '@angular/core'
import { ipcRenderer } from 'electron'
import { IFUa } from './f_ua.interface'
import * as _ from 'lodash'

@Component({
    selector: 'f-ua',
    templateUrl: './f_ua.partial.html'
})

export class fUAComponent extends SiteCommon {
    @Input('loadedData') loadedData: IFUa[]
    @Output() componentData = new EventEmitter<IFUa[]>()
    public zone: any
    public renderedData: IFUa[]

    constructor() {
        super()
    }

    onUpdateData(data, args) {
    //    this.zone.runOutsideAngular(() => {
    //         this.renderedData = _.flatten(args)
    //         console.log(this.renderedData)
    //     });
    }

    onSingleDataUpdated(event, args) {
        this.renderedData.push(args)
        this.renderedData = _.flatten(this.renderedData)
    }

    ngOnInit() {
        console.log(this);

        if (!this.loadedData) {
            this.$releaseTheBeast()
        } else {
            this.renderedData = this.loadedData
        }

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
